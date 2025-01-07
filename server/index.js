const express = require('express')
const app = express ()

app.use("/", (req, res) => {
    res.send("Sunucu Calisiyor.")
})

app.listen(5000, console.log("Sunucu Calisiyor Port 5000"));