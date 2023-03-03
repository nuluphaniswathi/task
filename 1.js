function test(){
    fetch("http://localhost:3500/test")
    .then(res=>res.json())
    .then(data=>console.log(data))
    .catch(err=>console.log(err))
}
let btn=document.querySelector(".btn");
btn.addEventListener('click',test);