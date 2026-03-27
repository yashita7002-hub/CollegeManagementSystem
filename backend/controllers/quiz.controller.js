/*import { asyncHandler } from "../utils/asyncHandler.js";
import { Quiz } from "../models/quiz.models.js";
import { QuizAttempt } from "../models/quizAttempt.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// GET /api/quizzes/:quizId/my-attempt
export const getMyQuizAttempt = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    
    // Assuming you have an authentication middleware setting req.user
    const studentId = req.user._id;
    // 1. Fetch this specific student's attempt
    const myAttempt = await QuizAttempt.findOne({ quizId: quizId, studentId: studentId });
    if (!myAttempt) {
        throw new ApiError(404, "You have not taken this quiz yet.");
    }
    // Security Feature: If the professor hasn't finished grading the written questions,
    // do not show the student the answer key yet!
    if (!myAttempt.isGraded) {
        return res.status(200).json(
            new ApiResponse(200, { 
                status: "Pending", 
                message: "Waiting for professor to evaluate your written answers." 
            })
        );
    }
    // 2. Fetch the Master Quiz so we can see what the correct answers were
    const masterQuiz = await Quiz.findById(quizId);
    // 3. Build a highly detailed report card for the frontend to render!
    // We map over their submitted answers and compare them to the Master Quiz.
    const detailedScorecard = myAttempt.submittedAnswers.map((studentAnswerObj) => {
        const trueQuestion = masterQuiz.questions.id(studentAnswerObj.questionId);
        // Figure out if they got this specific question right
        // If it's a written question, we just leave it as 'null' since the professor graded it manually
        const isCorrect = trueQuestion.type === 'MCQ' 
            ? studentAnswerObj.studentAnswer === trueQuestion.correctAnswer
            : null; 
        return {
            questionText: trueQuestion.questionText,
            type: trueQuestion.type,
            yourAnswer: studentAnswerObj.studentAnswer,
            
            // Only reveal the correct answer if it was an MCQ
            correctAnswer: (trueQuestion.type === 'MCQ') ? trueQuestion.correctAnswer : "Professor Evaluated manually",
            
            isCorrect: isCorrect,
            marksAvailable: trueQuestion.marksPerQuestion
        };
    });
    // 4. Send the total score and the breakdown of every question to the React frontend
    return res.status(200).json(
        new ApiResponse(200, {
            totalScore: myAttempt.totalScore,
            detailedResults: detailedScorecard
        }, "Detailed quiz review generated successfully!")
    );

});




// GET /api/quizzes/:quizId/leaderboard
export const getQuizLeaderboard = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    // Assuming you have auth middleware providing req.user._id
    const studentId = req.user._id;

    // 1. Fetch all graded attempts for THIS specific quiz, sorted Highest -> Lowest
    // We heavily rely on `.populate` here to fetch the names of the students who took it!
    const classAttempts = await QuizAttempt.find({ quizId: quizId, isGraded: true })
        .sort({ totalScore: -1 })
        .populate("studentId", "name username");

    if (!classAttempts || classAttempts.length === 0) {
        throw new ApiError(404, "No one has finished grading this quiz yet.");
    }

    // 2. Finding the Highest Marks is instantaneous because the array is sorted
    const highestMarks = classAttempts[0].totalScore;
    const highestStudent = classAttempts[0].studentId.name;

    // 3. Find where our specific logged-in student ranks!
    // We loop through the ranked array until we find an ID match
    const myRankIndex = classAttempts.findIndex(
        (attempt) => attempt.studentId._id.toString() === studentId.toString()
    );
    const myAttemptInfo = classAttempts[myRankIndex];

    // 4. Build a beautiful Top 5 scoreboard for the frontend
    const leaderboardUI = classAttempts.slice(0, 5).map((attempt, index) => ({
        rank: index + 1,
        name: attempt.studentId.name,
        score: attempt.totalScore
    }));

    // Send the structured data cleanly to the React/Vue Portal!
    return res.status(200).json(
        new ApiResponse(200, {
            quizId: quizId,
            myScore: myAttemptInfo ? myAttemptInfo.totalScore : "Not Taken Yet",
            myRank: myAttemptInfo ? (myRankIndex + 1) : "N/A",
            classHighest: {
                marks: highestMarks,
                student: highestStudent
            },
            leaderboardData: leaderboardUI
        }, "Dashboard metrics fetched successfully")
    );
});


export const evaluateQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    // Expected payload: [{ questionId: "...", selectedAnswer: "A" }]
    const { studentId, submittedAnswers } = req.body; 
    const activeQuiz = await Quiz.findById(quizId);
    if (!activeQuiz) throw new ApiError(404, "Quiz not found");
    let finalScore = 0;
    // 1. Evaluate the Quiz against your Master Answer Key
    submittedAnswers.forEach((studentAnswer) => {
        // Mongoose lets us search inside the nested questions array easily
        const masterQuestion = activeQuiz.questions.id(studentAnswer.questionId);
        if (masterQuestion && masterQuestion.type === 'MCQ') {
            // Did they get it right?
            if (masterQuestion.correctAnswer === studentAnswer.selectedAnswer) {
                // Add the specific marksPerQuestion to their total!
                finalScore += masterQuestion.marksPerQuestion; 
            }
        }
    });
    // 2. Save their finished attempt
    const attempt = await QuizAttempt.create({
        quizId: quizId,
        studentId: studentId,
        courseId: activeQuiz.courseId,
        totalScore: finalScore,
        isGraded: true // Immediately set to true because the computer graded it!
    });
    return res.status(201).json(
        new ApiResponse(201, { score: finalScore }, "Quiz evaluated successfully!")
    );
});





export const createQuiz = asyncHandler(async (req, res) => {
    // 1. Destructure the exact fields from your defined schema
    const { 
        title, 
        courseId, 
        branch, 
        year, 
        professorId, 
        questions, 
        timeLimitMinutes 
    } = req.body;
    // 2. Validate top-level required fields
    if (!title || !courseId || !branch || !year || !professorId || !questions) {
        throw new ApiError(400, "title, courseId, branch, year, professorId, and questions array are required fields.");
    }
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(400, "A quiz must have at least one question in the array.");
    }
    // 3. Verify the Course and Professor actually exist in the DB
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
        throw new ApiError(404, "Course not found.");
    }
    const professorExists = await Professor.findById(professorId);
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }
    // 4. Pre-Validation Check for the Questions Array
    // This gives the frontend specific error messages before Mongoose rejects the save
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.type === 'MCQ') {
            if (!q.options || q.options.length < 2) {
                throw new ApiError(400, `Question ${i + 1} is an MCQ but does not have enough options.`);
            }
            if (!q.correctAnswer) {
                throw new ApiError(400, `Question ${i + 1} is an MCQ but is missing a correctAnswer.`);
            }
        }
    }
    // 5. Create the Quiz
    const newQuiz = await Quiz.create({
        title,
        courseId,
        branch,
        year, // Evaluates to the Number type as per your schema
        professorId,
        questions,
        timeLimitMinutes: timeLimitMinutes || 30 // Matches your schema default
    });
    if (!newQuiz) {
        throw new ApiError(500, "Something went wrong while creating the quiz on the server.");
    }
    // 6. Send the newly created quiz back to the frontend
    return res.status(201).json(
        new ApiResponse(201, newQuiz, "Quiz created successfully!")
    );
});



// PUT /api/quizzes/evaluate-written/:attemptId
export const gradeWrittenAnswers = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const { manualWrittenMarks } = req.body; // e.g., 15 points

    // We use $inc to safely ADD their 15 written points to whatever score the 
    // MCQ auto-grader had already given them in step 1!
    const finalizedAttempt = await QuizAttempt.findByIdAndUpdate(
        attemptId,
        {
            $inc: { totalScore: manualWrittenMarks },
            $set: { isGraded: true } // Unlock the Leaderboard!
        },
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, finalizedAttempt, "Written answers completely evaluated!")
    );
});
 */