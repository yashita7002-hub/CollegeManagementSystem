import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler"




const giveGrade = asyncHandler((req,res) =>{

const {studentId,courseCode,professorId,internals.obtained, midSem.obtained,endSem.obtained,totalObtained} = req.body

if(!studentId || courseCode || professorId){
    throw new ApiError(400, "studentId,courseCode,professorId are mandatory fields")
}



});