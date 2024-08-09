document.addEventListener('DOMContentLoaded', () => {  
    // Get items from LocalStorage
    const currentEditingUserID = localStorage.getItem("userID");
    const thisAddressType = localStorage.getItem("addressType");

    document.getElementById('userAddressTitle').innerText = `CRUD for User(${currentEditingUserID})'s ${thisAddressType} Address`;
    var currentEditingAddressID = null; // Make sure to edit only one addresss
    refreshAddresses();   // Refresh Addresses in userID 


    // [Path 1] GET -- Generate Random User - 'http://localhost:5000/users/addresses/generate-address'
    document.getElementById('generateRandomAddress').addEventListener('click', (event) => {  
        event.preventDefault(); 

        axios.get(`http://localhost:5000/users/addresses/generate-address`)
        .then(response => {
            const addressData = response.data;
            console.log("Generate a Address", addressData);         
            
            // Fill the <form> with fetched Address
            let addressForm = document.getElementById('addressForm');                 
            Object.keys(addressData).forEach(key => {
                addressForm.elements[key].value = addressData[key]; 
            });
        })
        .catch(error => console.error(error.message));  
    });

    // [Path 2] GET - Read all addresses for a specific user - 'http://localhost:5000/users/addresses/get/:userID/:addressType'
    function refreshAddresses() {
        axios.get(`http://localhost:5000/users/addresses/get/${currentEditingUserID}/${thisAddressType}`)
        .then(response => {
            const addressList = document.getElementById('addressList');
            addressList.innerHTML = '';  // Clear Address Table

            const addressArray = response.data;
            console.log(addressArray);
            // If already has the type of address, disable create <button>
            document.getElementById('createAddressButton').disabled = (addressArray.length !== 0);

            addressArray.forEach(currentAddress => {
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
                        <a href="#" onclick="editAddress('${currentAddress._id.toString()}');">edit</a> / 
                        <a href="#" onclick="deleteAddress('${currentAddress._id.toString()}');">delete</a>
                    </td>
                `;
                addressList.appendChild(tr);
            });
        })
        .catch(error => console.error(error.message));   
    }    

    // [Path 3] POST - Create an address for a specific user - 'http://localhost:5000/users/addresses/create/:userID'
    document.getElementById('createAddressButton').addEventListener('click', (event) => {
        event.preventDefault();  
    
        // Populate `address` Object with the content of <form>
        let addressForm = document.getElementById('addressForm');
        var formData = new FormData(addressForm);
        var address = {};    
        formData.forEach((value, name) => address[name] = value);
        address.addressType = thisAddressType;
        
        axios.post(`http://localhost:5000/users/addresses/create/${currentEditingUserID}`, address)
        .then(response => {
            refreshAddresses(); // Refresh <table> after CREATE
            console.log(response.data, address);
            addressForm.reset(); // Clear the Form
        })
        .catch(error => console.error(error.message));
    });

    // [Path 4] GET - Read a specific address for a specific user - 'http://localhost:5000/users/addresses/get/:userID/:addressID'
    window.editAddress = function (addressID) {     
        currentEditingAddressID = addressID;  // Change current Editing addressID

        axios.get(`http://localhost:5000/users/addresses/getone/${currentEditingUserID}/${currentEditingAddressID}`)
        .then(response => {
            console.log("Get this Address", response.data); 
            let addressData = {...response.data}; // light copy, avoid changing the original data
            delete addressData._id; 
            delete addressData.userID; 
            delete addressData.addressType; 
            delete addressData.__v;  

            // Fill the <form> with fetched Address
            let addressForm = document.getElementById('addressForm');                 
            Object.keys(addressData).forEach(key => {          
                addressForm.elements[key].value = addressData[key];                   
            });

            // Enable edit <button>, disable create <button>
            document.getElementById('editAddressButton').disabled = false;
            document.getElementById('createAddressButton').disabled = true;
        })
        .catch(error => console.error(error.message));
    }

    // [Path 5] PUT - Update a specific address for a specific user - 'http://localhost:5000/users/addresses/update/:userID/:addressID'
    document.getElementById('editAddressButton').addEventListener('click',  (event) => {
        event.preventDefault();

        // Populate `address` Object with the content of <form>
        let addressForm = document.getElementById('addressForm');
        var formData = new FormData(addressForm);
        var address = {};    
        formData.forEach((value, name) => address[name] = value);
        address.addressType = thisAddressType;
        
        axios.put(`http://localhost:5000/users/addresses/update/${currentEditingUserID}/${currentEditingAddressID}`, address)
        .then(response => {
            refreshAddresses(); // Refresh <table> after CREATE
            console.log(`Address: ${currentEditingAddressID} of User: ${currentEditingUserID} updated:`, response.data);
            addressForm.reset(); // Reset the form

            // Disable edit <button>
            document.getElementById('editAddressButton').disabled = true;
        })
        .catch(error => console.error(error.message)); 
    });    

    // [Path 6] DELETE - Delete a specific address for a specific user - '/users/:userID/addresses/delete/:addressID'   
    window.deleteAddress = function(addressID) {
        axios.delete(`http://localhost:5000/users/addresses/delete/${currentEditingUserID}/${addressID}`)
        .then(response => {
            console.log(response.data);
            refreshAddresses(); // Refresh <table> after CREATE
        })
        .catch(error => console.error(error.message));
    };  
});