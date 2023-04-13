function sidebar() {
    if (document.getElementById("sidebar").style.display != "none") {
        closeSidebar();
    }
    else {
        openSidebar();
    }
}

function showAlertDelete(counter) {
    document.getElementById(`alertDelete${counter}`).style.display = "block";
}

function hideAlertDelete(counter) {
    document.getElementById(`alertDelete${counter}`).style.display = "none";
}

function openSidebar() {
    document.getElementById("sidebar").style.display = "block";
    
    if (document.getElementById("editButtons") != null) {
        document.getElementById("editButtons").style.display = "block";
    }

    if (document.getElementById("goBack") != null) {
        document.getElementById("goBack").style.display = "block";
    }
    
    if (document.getElementById("dashboard") != null) {
        document.getElementById("dashboard").style.display = "block";
    }

    if (document.getElementById("goComment") != null) {
        document.getElementById("goComment").style.display = "block";
    }
}

function closeSidebar() {
    document.getElementById("sidebar").style.display = "none";

    if (document.getElementById("editButtons") != null) {
        document.getElementById("editButtons").style.display = "none";
    }

    if (document.getElementById("goBack") != null) {
        document.getElementById("goBack").style.display = "none";
    }

    if (document.getElementById("dashboard") != null) {
        document.getElementById("dashboard").style.display = "none";
    }

    if (document.getElementById("goComment") != null) {
        document.getElementById("goComment").style.display = "none";
    }

    if (document.getElementById("goBackSearcherLogged") != null) {
        document.getElementById("goBackSearcherLogged").style.display = "none";
    }
}

//Display of links and divs without loggin and loged in
function home() {
    document.getElementById('whoAreWe').style.display = 'block';
    document.getElementById('comunity').style.display = 'none';
}

function comunity() {
    document.getElementById('comunity').style.display = 'block';
    document.getElementById('whoAreWe').style.display = 'none';
}

function userInformation() {
    document.getElementById('linkHome').style.display = 'none';
    document.getElementById('whoAreWe').style.display = 'none';
    document.getElementById('comunity').style.display = 'block';
}

function loged() {
    document.getElementById('whoAreWe').style.display = 'none';
    document.getElementById('linkHome').style.display = 'block';
    document.getElementById('comunity').style.display = 'block';
    document.getElementById('dashboard').style.display = 'block';
}

function register() {
    document.getElementById('logOut').style.display = 'none';
    document.getElementById('linkHome').style.display = 'none';
    document.getElementById('whoAreWe').style.display = 'none';
    document.getElementById('comunity').style.display = 'block';
}

//Checkers
function loginChecker(event) {
    let email = document.getElementById('userEmail').value;
    let password = document.getElementById('passwd').value;
    let userName = document.getElementById('userName').value;

    if (password.length < 6) {
        alert("The password must be at least 6 characters large");
        event.preventDefault();
    }
    else if (email == "" && userName == "") {
        alert("You must complete or the email field or the user name field");
        event.preventDefault();
    }
    else {
        alert("If you do not log in, check your user name and your password. Else, send this incident to the administration");
    }
}

function noFieldValue(event, collection) {
    let value = false;

    if (collection == "category") {
        if (document.getElementById('name').value != "") {
            value = true;
        }
        else if (document.getElementById('id').value != "") {
            value = true;
        }
    }
    else if (collection == "comment") {
        if (document.getElementById('content').value != "") {
            value = true;
        }
        else if (document.getElementById('post').value != "none") {
            value = true;
        }
        else if (document.getElementById('userId').value != "none") {
            value = true;
        }
        else if (document.getElementById('userName').value != "none") {
            value = true;
        }
        else if (document.getElementById('email').value != "none") {
            value = true;
        }
        else if (document.getElementById('id').value != "") {
            value = true;
        }
        else if (document.getElementById('likes').value != "") {
            value = true;
        }
        else if (document.getElementById('dislikes').value != "") {
            value = true;
        }
    }
    else if (collection == "date") {
        if (document.getElementById('date').value != "") {
            value = true;
        }
        else if (document.getElementById('id').value != "") {
            value = true;
        }
        else if (document.getElementById('times').value != "") {
            value = true;
        }
    }
    else if (collection == "post") {
        if (document.getElementById('title').value != "") {
            value = true;
        }
        else if (document.getElementById('content').value != "") {
            value = true;
        }
        else if (document.getElementById('media').value != "") {
            value = true;
        }
        else if (document.getElementById('category').value != "none") {
            value = true;
        }
        else if (document.getElementById('date').value != "none") {
            value = true;
        }
        else if (document.getElementById('id').value != "") {
            value = true;
        }
        else if (document.getElementById('userId').value != "none") {
            value = true;
        }
        else if (document.getElementById('email').value != "none") {
            value = true;
        }
        else if (document.getElementById('userName').value != "none") {
            value = true;
        }
        else if (document.getElementById('comments').value != "") {
            value = true;
        }
        else if (document.getElementById('likes').value != "") {
            value = true;
        }
        else if (document.getElementById('dislikes').value != "") {
            value = true;
        }
    }
    else if (collection == "user") {
        if (document.getElementById('email').value != "") {
            value = true;
        }
        else if (document.getElementById('name').value != "") {
            value = true;
        }
        else if (document.getElementById('userDescription').value != "") {
            value = true;
        }
        else if (document.getElementById('image').value != "") {
            value = true;
        }
        else if (document.getElementById('passwd').value != "") {
            value = true;
        }
        else if (document.getElementById('id').value != "") {
            value = true;
        }
        else if (document.getElementById('publications').value != "") {
            value = true;
        }
        else if (document.getElementById('comments').value != "") {
            value = true;
        }
        else if (document.getElementById('totalLikes').value != "") {
            value = true;
        }
        else if (document.getElementById('totalDislikes').value != "") {
            value = true;
        }
    }
    else {
        event.preventDefault();

        alert("Error in collection value");
    }

    if (!value) {
        event.preventDefault();

        alert("At least one input must be filled with information");
    }
}

function registerChecker(event) {
    let password = document.getElementById('passwd');
    let repeatPassword = document.getElementById('repeatPasswd');

    if (password.value.length < 6) {
        event.preventDefault();
        alert("The password must be at least 6 characters large");
    }
    else if (password.value == repeatPassword.value) {
        alert("The passwords match");
    }
    else {
        event.preventDefault();

        alert("The passwords do not match");
        password.style.border = '2px solid red';
        repeatPassword.style.border = '2px solid red';
    }
}

function updateChecker(event) {
    let password = document.getElementById('passwd');
    let repeatPassword = document.getElementById('repeatPasswd');

    if (password.value != "") {
        if (password.value.length < 6) {
            event.preventDefault();
            alert("The password must be at least 6 characters large");
        }
        else if (password.value != repeatPassword.value) {
            event.preventDefault();
        
            alert("The passwords do not match");
            password.style.border = '1px solid red';
            repeatPassword.style.border = '1px solid red';
        }
    }
}

//Functionalities
function copy(link) {
    navigator.clipboard.writeText(link);
    alert("The post link have been copied.");
}

function collectionFields() {
    let collection = document.getElementById('collection').value;
    let html = "";

    if (collection == "posts") {
        document.getElementById('cat').style.display = "none";
        document.getElementById('userInput').style.display = "block";
        document.getElementById('post-user').style.display = "block";

        if (document.getElementById('currentDate') != null) {
            document.getElementById('currentDate').style.display = "none";
        }

        html = `<select name="field" id="publicationField" class="form-control">
                    <option value="undefined"> Field </option>
                    <option value="userName"> User name </option>
                    <option value="email"> User email </option>
                    <option value="title"> Title </option>
                    <option value="content"> Content </option>
                    <option value="likes"> Likes </option>
                    <option value="dislikes"> Dislikes </option>
                    <option value="comments"> Comments </option>
                </select>`;
    }
    else if (collection == "users") {
        document.getElementById('post-user').style.display = "block";
        document.getElementById('userInput').style.display = "block";
        document.getElementById('cat').style.display = "none";

        if (document.getElementById('currentDate') != null) {
            document.getElementById('currentDate').style.display = "none";
        }

        html = `<select name="field" id="field" class="form-control">
                    <option value="undefined"> Field </option>
                    <option value="name"> User name </option>
                    <option value="email"> User email </option>
                    <option value="userDescription"> User description </option>
                    <option value="publications"> Publications made </option>
                    <option value="comments"> Comments made </option>
                    <option value="totalLikes"> Likes acumulated </option>
                    <option value="totalDislikes"> Dislikes acumulated </option>
                </select>`;
    }
    else if (collection == "category") {
        document.getElementById('cat').style.display = "block";
        document.getElementById('post-user').style.display = "none";
        document.getElementById('userInput').style.display = "none";

        if (document.getElementById('currentDate') != null) {
            document.getElementById('currentDate').style.display = "none";
        }
    }
    else if (collection == "date") {
        document.getElementById('cat').style.display = "none";
        document.getElementById('post-user').style.display = "none";
        document.getElementById('userInput').style.display = "none";
        document.getElementById('currentDate').style.display = "block";
    }
    else {
        html = `<strong class="text-red">There was an error, please, report this to the administration</strong>`;
    }

    document.getElementById('inputField').innerHTML = html;
}

async function inputValues() {
    let field = document.getElementById('publicationField').value;
    let html = "";

    if (field == "undefined" || field == "userName" || field == "email" || field == "title") {
        html = `<input type="text" name="value" class="form-control" id="value" placeholder="Write the value"/>`;
    }
    else if (field == "content" || field == "userDescription") {
        html = `<textarea name="value" class="form-control" id="value" placeholder="Write the value"></textarea>`;
    }
    else if (field == "likes" || field == "dislikes" || field == "comments" || field == "publications" || field == "totalLikes" || field == "totalDislikes") {
        html = `<select name="operator" id="operator" class="form-control">
                    <option value="<"> Less than </option>
                    <option value="<="> Less or equal to </option>
                    <option value="=="> Equal to </option>
                    <option value=">="> More or equal to </option>
                    <option value=">"> More than </option>
                </select>
                <input type="number" name="value" class="form-control" id="value" placeholder="Write a number" />`;
    }
    else {
        html = "There was an error, please, report it to the administration";
    }

    document.getElementById('inputValue').innerHTML = html;
}