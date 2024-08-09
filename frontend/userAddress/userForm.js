function toggleTitleOther(input) {
    const titleOtherGroup = document.getElementById('titleOtherGroup');
    let titleValue = (input instanceof Element)? input.value : input;
    
    if(titleValue == 'Other'){
        titleOtherGroup.style.display = 'block';
    } else {
        titleOtherGroup.style.display = 'none';
        document.querySelector('input[name="titleOther"]').value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {  
    // Clear items in LocalStorage.
    localStorage.removeItem('userID');
    localStorage.removeItem('addressType');

    var currentEditingUserID = null; // Make sure to edit only one user
    refreshUsers(); // Refresh Users when browser loaded

        
    // [Path 1] GET -- Generate Random User - 'http://localhost:5000/users/generate-user'
    document.getElementById('generateRandomUser').addEventListener('click', (event) => {  
        event.preventDefault(); 

        axios.get(`http://localhost:5000/users/generate-user`)
        .then(response => {
            const userData = response.data;
            console.log("Generate a User", userData); 
            
            // Fill the <form> with fetched User
            let userForm = document.getElementById('userForm');
            Object.keys(userData).forEach(key => {
                userForm.elements[key].value = userData[key];                       
            });
            toggleTitleOther(userData.title);   
        })
        .catch(error => console.error(error.message));  
    });

    // [Path 2] GET - Get all Users - 'http://localhost:5000/users/get'
    function refreshUsers() {
        axios.get('http://localhost:5000/users/get')
        .then(response => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';  // Clear User Table

            // Create every Table Row in <tbody id="userList">
            const userArray = response.data;
            console.log(userArray);
            userArray.forEach(currentUser => {
                const titleDisplay = currentUser.title === 'Other' ?
                currentUser.titleOther : currentUser.title;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${currentUser._id.toString()}</td>
                    <td>${titleDisplay}</td>
                    <td>${currentUser.firstName}</td>
                    <td>${currentUser.surName}</td>
                    <td>${currentUser.mobile}</td>
                    <td>${currentUser.email}</td>
                    <td>
                        <a href="./addressForm.html" onclick="showAddressTable('${currentUser._id.toString()}', 'home');">
                            Home Address
                        </a>
                    </td>
                    <td>
                        <a href="./addressForm.html" onclick="showAddressTable('${currentUser._id.toString()}', 'shipping');">
                            Shipping Address
                        </a>
                    </td>
                    <td>
                        <a href="#" onclick="editUser('${currentUser._id.toString()}')">edit</a> / 
                        <a href="#" onclick="deleteUser('${currentUser._id.toString()}');">delete</a>
                    </td>
                `;
                userList.appendChild(tr);
            });
        })
        .catch(error => console.error(error.message));        
    }

    // [Path 3] POST - Create a User - 'http://localhost:5000/users/create'
    document.getElementById('createUserButton').addEventListener('click', (event) => {
        event.preventDefault(); 

        // Populate `user` Object with the content of <form>
        let userForm = document.getElementById('userForm');
        var formData = new FormData(userForm);
        var user = {};         
        formData.forEach((value, name) => user[name] = value); 

        axios.post('http://localhost:5000/users/create', user)
        .then(response => {
            refreshUsers(); // Refresh <table> after CREATE
            console.log(response.data, user);
            userForm.reset(); // Clear the Form
        })
        .catch(error => console.error(error.message));
    });  

    // [Path 4] GET - Get a User - 'http://localhost:5000/users/get/:userID'
    window.editUser = function(userID) {       
        currentEditingUserID = userID;  // Change current Editing UserID   

        axios.get(`http://localhost:5000/users/get/${userID}`)
        .then(response => {
            console.log("Get this User", response.data); 
            let userData = {...response.data}; // light copy, avoid changing the original data
            delete userData._id; 
            delete userData.__v; 
        
            // Fill the <form> with fetched User
            let userForm = document.getElementById('userForm');
            Object.keys(userData).forEach(key => {
                userForm.elements[key].value = userData[key];                         
            });
            toggleTitleOther(userForm.title);

            // Enable edit <button>, disable create <button>
            document.getElementById('editUserButton').disabled = false;
            document.getElementById('createUserButton').disabled = true;
        })
        .catch(error => console.error(error.message));  
    };

    // [Path 5] PUT - Update a User - 'http://localhost:5000/users/update/:userID'
    document.getElementById('editUserButton').addEventListener('click', (event) => {
        event.preventDefault();

        // Populate `user` Object with the content of <form>
        let userForm = document.getElementById('userForm');
        var formData = new FormData(userForm);
        var user = {};
        formData.forEach((value, name) => user[name] = value);

        axios.put(`http://localhost:5000/users/update/${currentEditingUserID}`, user)
        .then(response => {
            refreshUsers(); // Refresh <table> after UPDATE
            console.log(`User: ${currentEditingUserID} updated`, response.data);
            userForm.reset(); // Clear the form
    
            // Disable edit <button>, enable create <button>
            document.getElementById('editUserButton').disabled = true;
            document.getElementById('createUserButton').disabled = false;
        })
        .catch(error => console.error(error.message)); 
    });

    // [Path 6] DELETE - Delete a User - 'http://localhost:5000/users/delete/:userID'
    window.deleteUser = function(userID) {
        axios.delete(`http://localhost:5000/users/delete/${userID}`)
        .then(response => {
            console.log(response.data);
            refreshUsers(); // Refresh the list after deleting
        })
        .catch(error => console.error(error.message));
    };  


    // Add items into LocalStorage
    window.showAddressTable = function(userID, addressType) {
        localStorage.setItem("userID", userID);
        localStorage.setItem("addressType", addressType);
    }  
});