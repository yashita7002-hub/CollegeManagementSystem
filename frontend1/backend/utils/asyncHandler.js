/*
without this I am supposed to write try and catch everywhere
*/


const asyncHandler = (requestHandler) =>{
return    (req, res, next)=>{
    Promise.resolve(requestHandler(req,res,next))
    .catch((err) => next(err))
   }
}


export {asyncHandler}