document.addEventListener('DOMContentLoaded', function() {
    refreshPhones(); // Refresh <table> when Page loaded
    var currentEditingPhoneID = null; // Make sure to edit only one phone
    

    // [Path 1 -- Create] -- Generate Random Phone - 'http://localhost:5000/phones/generate-phone'
    document.getElementById('generateRandomPhone').addEventListener('click', (event) => {  
        event.preventDefault(); 

        axios.get(`http://localhost:5000/phones/generate-phone`)
        .then(response => {
            const phoneData = response.data;
            console.log("Generate a Phone", phoneData);
        
            // Fill the <form> with fetched Phone
            let phoneForm = document.getElementById('phoneForm');
            Object.keys(phoneData).forEach(key => {
                phoneForm.elements[key].value = phoneData[key];                       
            });

        })
        .catch(error => console.error(error.message));  
    });

    // [Path 2 - Get] -- Get all Phones - 'http://localhost:5000/phones/get'
    function refreshPhones() {
        axios.get('http://localhost:5000/phones/get')
        .then(response => {
            const phoneList = document.getElementById('phoneList');
            phoneList.innerHTML = ''; // Clear Phone Table
            
            const phoneArray = response.data;
            console.log(phoneArray);
            // If has more than 10 Phones, disable create <button>
            document.getElementById('createPhoneButton').disabled = (phoneArray.length >= 10);

            phoneArray.forEach(currentPhone => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${currentPhone._id.toString()}</td> 
                    <td>${currentPhone.manufacturer}</td>
                    <td>${currentPhone.model}</td>
                    <td>${currentPhone.price}</td>
                    <td>
                        <a href="#" onclick="editPhone('${currentPhone._id.toString()}')">edit</a> / 
                        <a href="#" onclick="deletePhone('${currentPhone._id.toString()}')">delete</a>
                    </td>
                `;
                phoneList.appendChild(tr);
            });
        })
        .catch(error => console.error(error.message));
    }

    // [Path 3 - POST] -- Create a Phone - 'http://localhost:5000/phones/create'
    document.getElementById('createPhoneButton').addEventListener('click', (event) => {
        event.preventDefault(); 

        // Populate `phone` Object with the content of <form>
        let phoneForm = document.getElementById('phoneForm');
        var formData = new FormData(phoneForm);
        var phone = {};
        formData.forEach((value, name) => phone[name] = value);

        axios.post('http://localhost:5000/phones/create', phone)
        .then(response => {
            refreshPhones(); // Refresh <table> after CREATE
            console.log(response.data, phone);
            phoneForm.reset(); // Clear the form
        })
        .catch(error => console.error(error.message));
    });      

    // [Path 4 - GET] -- Get a Phone - 'http://localhost:5000/phones/get/:phoneID'
    window.editPhone = function(phoneID) {             
        currentEditingPhoneID = phoneID;  // Change current Editing PhoneID  

        axios.get(`http://localhost:5000/phones/get/${phoneID}`)
        .then(response => {
            console.log("Get this Phone", response.data); 
            let phoneData = {...response.data}; // light copy, avoid changing the original data
            delete phoneData._id; 
            delete phoneData.__v; 
        
            // Fill the <form> with fetched Phone
            let phoneForm = document.getElementById('phoneForm');
            Object.keys(phoneData).forEach(key => {
                phoneForm.elements[key].value = phoneData[key];                         
            });
        
            // Enable edit <button>, disable create <button>
            document.getElementById('editPhoneButton').disabled = false;
            document.getElementById('createPhoneButton').disabled = true;
        })
        .catch(error => console.error(error.message));      
    };


    // [Path 5 - PUT] -- Update a Phone - 'http://localhost:5000/phones/update/:phoneID'
    document.getElementById('editPhoneButton').addEventListener('click',  (event) => {
        event.preventDefault();    

        // Populate `phone` Object with the content of <form>
        let phoneForm = document.getElementById('phoneForm');
        var formData = new FormData(phoneForm);
        var phone = {};
        formData.forEach((value, name) => phone[name] = value);

        axios.put(`http://localhost:5000/phones/update/${currentEditingPhoneID}`, phone)
        .then((response) => {
            refreshPhones(); // Refresh <table> after UPDATE
            console.log(`Phone: ${currentEditingPhoneID} updated`, response.data);
            phoneForm.reset(); // Clear the form
    
            // Disable edit <button>, enable create <button>
            document.getElementById('editPhoneButton').disabled = true;
            document.getElementById('createPhoneButton').disabled = false;
        })
        .catch(error => console.error(error.message));     
    });

    // [Path 6 -- DELETE] -- Delete a Phone - 'http://localhost:5000/phones/delete/:phoneID'
    window.deletePhone = function(phoneID) {             
        axios.delete(`http://localhost:5000/phones/delete/${phoneID}`)
        .then(() => {
            console.log(`Phone: ${phoneID} deleted successfully`);
            refreshPhones(); // Refresh the list after deleting
        })
        .catch(error => console.error(error.message));
    };
}); // End of Load Page