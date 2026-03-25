import express from "express"

const app = express()


app.get("/", (req, res) => {
    
    res.send("Server working")
})


const port = process.env.PORT || 2000;

app.listen(port, ()=>{
    console.log(`Server at http://localhost:${port}`);
});

export {app}