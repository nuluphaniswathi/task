const exp=require("express");
const app=exp();
app.listen(3500,()=>console.log("http server on port 3500"));
require("dotenv").config();
//database connection
const mysql=require("mysql2");
const expressAsyncHandler=require("express-async-handler");
const bcryptjs=require("bcryptjs");
//cors middleware it adds allow-access-origin:* so we can access from different origins
//app.use(cors({origin:"https://path"}))
const cors=require("cors");
app.use(cors())



//establishing the connection betweeen db client and sql db
const connection=mysql.createConnection(
    {
        user:"wal",
        port:3306,
        password:process.env.DB_PASSWORD,
        database:"test_sessions",
        host:"localhost",
    }
);
connection.connect((err)=>{
    if(!err){
        console.log("db connected");
    }
    else{
        console.log("db not connected");
    }
});
const db=connection.promise();
//import 
const session=require("express-session");
const MYSQLStore=require('express-mysql-session')(session);
//create session store
const sessionStore=new MYSQLStore({},connection.promise());//provide promise() to connection otherwise eror
//configure express session
//use the application at application level app.use()
app.use(
    session({
        secret:'some secret',
        saveUninitialized:false,
        resave:false,
        store:sessionStore,
        cookie:{
            maxAge:100000
        }
    })
)

app.get("/test",(req,res)=>{

    //req.session.id="200";
    //req.session.user="hello";
    //console.log(req.headers);
    /*
    if(req.session.pageView);
    {
   //req.session.pageView++;
    res.send({message:`you requested this route for ${req.session.pageView++}`});
    }
    console.log(req.session.pageView);*/
    /*
    if(req.session.cookie.username==undefined)
    {
        res.send({message:"unauthorized access"});
    }
    else
    {
        res.send({message:"authorized"});
    }*/
    console.log("test",req.session);
    res.send({message:"from get",payload:req.session});
})
//req.session is used to either to get or set properties of sessiontable
//req.session is referring to database
//bodyparser
app.use(exp.json());
//user login
app.post("/login",(req,res)=>{
    let {username,password}=req.body;
    if(username=="swathi"&&password=="swathi123")
    {
        //initialize session
        req.session.username=username;
        req.session.password=password;
        req.session.pageView=1;
        res.send({message:`welcome to ${username}`});
    }
    else
    {
        res.send({message:"Invalidcredentials"});
    }


})
//user logout
app.get('/logout',(req,res)=>{
    if(req.session.username)
    {
    req.session.destroy(()=>{
        res.send({message:"Logout success"})
    })
}
else
{
    res.send({message:"invalid request"})
}

})
//modify user-private route
app.put('/modify',expressAsyncHandler(async(req,res)=>{
    let {username,password}=req.body;
    let [rows]=await db.query('select * from user where username=?',username)
    
    if(rows[0]==undefined)
    {
        res.status(200).send({message:"user not existed to modify"});
    }
    else{
        //hash password
        //let hashedPassword=await bcryptjs.hash(password,5)
        //if hash is asynchrounous contains a string and salt =>if salt is low,processing fast security low=>if salt high 
        //processing low security high salt ranges from 0-10 
        //replace plain password with hashed password
        //password=hashedPassword;
        req.session.username=username;
        req.session.password=password;
        console.log(req.session);
        let [rows]=await db.query('update user set username=?,password=?',[username,password]);
        console.log(rows);

        
        res.status(201).send({message:"user is modified"});
    }
}));
app.post("/create-user",expressAsyncHandler(async(req,res)=>{
    //get user from req
    let {username,password}=req.body;
    //find duplicate user
    let [rows]=await db.query('select * from user where username=?',username)
    //if duplicate employee is existed,send res as duplicate employee
    if(rows[0]!==undefined)
    {
        res.status(200).send({message:"user already existed"});
    }
    //else insert neew employee in usertable
    else{
        //hash password
        //let hashedPassword=await bcryptjs.hash(password,5)
        //if hash is asynchrounous contains a string and salt =>if salt is low,processing fast security low=>if salt high 
        //processing low security high salt ranges from 0-10 
        //replace plain password with hashed password
        //password=hashedPassword;
        await db.query('insert into user set username=?,password=?',[username,password]);
        res.status(201).send({message:"user created"});
    }
}));


