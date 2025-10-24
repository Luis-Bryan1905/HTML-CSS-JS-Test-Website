const clickFunction=()=>
{
    document.getElementById("demo").innerHTML = "This is New Content"
}

document.getElementById("demo").addEventListener("click", clickFunction); // Event Listener