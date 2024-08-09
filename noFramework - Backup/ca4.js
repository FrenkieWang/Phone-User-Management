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
    var currentEditingUserID = null; // Make sure to edit only one user
    var currentEditingAddressID = null; // Make sure to edit only one addresss
    refreshUsers(); // Refresh Users when browser loaded


    // [Path 1] GET - Get all Users - 'http://localhost:5000/users/get'
    function refreshUsers() {
        axios.get('http://localhost:5000/users/get')
        .then(response => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';  // Clear User Table

            // Create every Table Row in <tbody id="userList">
            const userData = response.data;
            console.log(userData);
            userData.forEach(currentUser => {
                const titleDisplay = currentUser.title === 'Other' ?
                currentUser.titleOther : currentUser.title;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${currentUser._id.toString()}</td>
                    <td>${titleDisplay }</td>
                    <td>${currentUser.firstName}</td>
                    <td>${currentUser.surName}</td>
                    <td>${currentUser.mobile}</td>
                    <td>${currentUser.email}</td>
                    <td>
                        <a href="#" onclick="showAddressTable('${currentUser._id.toString()}');">Show Address</a>
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

    // [Path 2] GET -- Generate Random User - 'http://localhost:5000/users/generate-user'
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
        document.getElementById('editingUser').innerText = `Editing User: ${userID}`;

        axios.get(`http://localhost:5000/users/get/${userID}`)
        .then(response => {
            const user = response.data;
            console.log("Get this User", user); 
            let userData = {...user}; // light copy, avoid changing the original data
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


    // [Show Address] - Function in each Row with `userID`
    window.showAddressTable = function(userID) {
        // Hide UserPage and show AddressPage.
        document.getElementById('userDashBoard').style.display = 'none';
        document.getElementById('addressDashBoard').style.display = 'block';
        // Disable edit <button>, enable create <button>
        document.getElementById('editAddressButton').disabled = true;
        document.getElementById('createAddressButton').disabled = false;

        currentEditingUserID = userID;
        document.getElementById('userAddressTitle').innerText = `CRUD for User(${userID})'s Address`;
        refreshAddresses();  // Refresh Addresses in userID 
    }    

    // [Path 7] GET - Read all addresses for a specific user - 'http://localhost:5000/users/addresses/get/:userID'
    function refreshAddresses() {
        axios.get(`http://localhost:5000/users/addresses/get/${currentEditingUserID}`)
        .then(response => {
            const addressList = document.getElementById('addressList');
            addressList.innerHTML = '';  // Clear Address Table

            const addresses = response.data;
            addresses.forEach(currentAddress => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${currentAddress.userID}</td>
                    <td>${currentAddress._id.toString()}</td>
                    <td>${currentAddress.addressType}</td>
                    <td>${currentAddress.addressLine1} &nbsp; ${currentAddress.addressLine2 || ''}</td>
                    <td>${currentAddress.town}</td>
                    <td>${currentAddress.countyCity}</td>
                    <td>${currentAddress.eircode || ''}</td>
                    <td>
                        <a href="#" onclick="editAddress('${currentEditingUserID}', '${currentAddress._id.toString()}');">edit</a> / 
                        <a href="#" onclick="deleteAddress('${currentEditingUserID}', '${currentAddress._id.toString()}');">delete</a>
                    </td>
                `;
                addressList.appendChild(tr);
            });
        })
        .catch(error => console.error(error.message));   
    }    

    // [Path 8] GET -- Generate Random User - 'http://localhost:5000/users/addresses/generate-address'
    document.getElementById('generateRandomAddress').addEventListener('click', (event) => {  
        event.preventDefault(); 

        axios.get(`http://localhost:5000/users/addresses/generate-address`)
        .then(response => {
            const addressData = response.data;
            console.log("Generate a Address", addressData);         
            
            // Fill the <form> with fetched Address
            let addressForm = document.getElementById('addressForm');                 
            Object.keys(addressData).forEach(key => {
                const element = addressForm.elements[key];  

                if(element instanceof NodeList){
                    if (element[0]?.type === 'radio'){
                        const radioValue = addressData[key];
                        document.querySelectorAll(`input[name="${key}"]`).forEach(radio => {
                            radio.checked = (radioValue === radio.value);
                        });
                    }                                                 
                } 
                else {
                    element.value = addressData[key];
                }     
            });
        })
        .catch(error => console.error(error.message));  
    });

    // [Path 9] POST - Create an address for a specific user - 'http://localhost:5000/users/addresses/create/:userID'
    document.getElementById('createAddressButton').addEventListener('click', (event) => {
        event.preventDefault();  
    
        // Populate `address` Object with the content of <form>
        let addressForm = document.getElementById('addressForm');
        var formData = new FormData(addressForm);
        var address = {};    
        formData.forEach((value, name) => address[name] = value);
        
        axios.post(`http://localhost:5000/users/addresses/create/${currentEditingUserID}`, address)
        .then(response => {
            refreshAddresses(); // Refresh <table> after CREATE
            console.log(response.data, address);
            addressForm.reset(); // Clear the Form
        })
        .catch(error => console.error(error.message));
    });

    // [Path 10] GET - Read a specific address for a specific user - 'http://localhost:5000/users/addresses/get/:userID/:addressID'
    window.editAddress = function (userID, addressID) {
        // Change current Editing UserID and addressID, render them in Page
        currentEditingUserID = userID;  
        document.getElementById('editingUser').innerText = `Editing User: ${currentEditingUserID}`;        
        currentEditingAddressID = addressID;   
        document.getElementById('editingAddress').innerText = `Editing Address: ${currentEditingAddressID}`;

        axios.get(`http://localhost:5000/users/addresses/get/${currentEditingUserID}/${currentEditingAddressID}`)
        .then(response => {
                const address = response.data;
                console.log("Get this Address", address); 
                let addressData = {...address}; // light copy, avoid changing the original data
                delete addressData._id; 
                delete addressData.userID; 
                delete addressData.__v;  

                // Fill the <form> with fetched Address
                let addressForm = document.getElementById('addressForm');                 
                Object.keys(addressData).forEach(key => {
                    const element = addressForm.elements[key];  

                    if(element instanceof NodeList){
                        if (element[0]?.type === 'radio'){
                            const radioValue = addressData[key];
                            document.querySelectorAll(`input[name="${key}"]`).forEach(radio => {
                                radio.checked = (radioValue === radio.value);
                            });
                        }                                                 
                    } 
                    else {
                        element.value = addressData[key];
                    }     
                });
    
                // Enable edit <button>, disable create <button>
                document.getElementById('editAddressButton').disabled = false;
                document.getElementById('createAddressButton').disabled = true;
        })
        .catch(error => console.error(error.message));
    }

    // [Path 11] PUT - Update a specific address for a specific user - 'http://localhost:5000/users/addresses/update/:userID/:addressID'
    document.getElementById('editAddressButton').addEventListener('click',  (event) => {
        event.preventDefault();

        // Populate `address` Object with the content of <form>
        let addressForm = document.getElementById('addressForm');
        var formData = new FormData(addressForm);
        var address = {};    
        formData.forEach((value, name) => address[name] = value);
        
        axios.put(`http://localhost:5000/users/addresses/update/${currentEditingUserID}/${currentEditingAddressID}`, address)
        .then(response => {
            refreshAddresses(); // Refresh <table> after CREATE
            console.log(`Address: ${currentEditingAddressID} of User: ${currentEditingUserID} updated:`, response.data);
            addressForm.reset(); // Reset the form

            // Disable edit <button>, enable create <button>
            document.getElementById('editAddressButton').disabled = true;
            document.getElementById('createAddressButton').disabled = false;
        })
        .catch(error => console.error(error.message)); 
    });    

    // [Path 12] DELETE - Delete a specific address for a specific user - '/users/:userID/addresses/delete/:addressID'   
    window.deleteAddress = function(userID, addressID) {
        axios.delete(`http://localhost:5000/users/addresses/delete/${userID}/${addressID}`)
        .then(response => {
            console.log(response.data);
            refreshAddresses(); // Refresh <table> after CREATE
        })
        .catch(error => console.error(error.message));
    };

    // [Back To User List] - Function of Link
    document.getElementById('backToUserList').addEventListener('click', (event) => {
        event.preventDefault();

        // Show UserPage and hide AddressPage.            
        document.getElementById('userDashBoard').style.display = 'block';
        document.getElementById('addressDashBoard').style.display = 'none';
        // Disable edit <button>, enable create <button>
        document.getElementById('editUserButton').disabled = true;
        document.getElementById('createUserButton').disabled = false;
         
        // Clear editing userID and addressID
        currentEditingUserID = null; 
        currentEditingAddressID = null; 
        document.getElementById('editingUser').innerText = `Editing User: None`;
        document.getElementById('editingAddress').innerText = `Editing Address: None`;

        refreshUsers(); // Refresh Users when browser loaded   
    });
});