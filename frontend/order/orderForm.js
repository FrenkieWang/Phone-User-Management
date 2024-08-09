// Function to fetch users and render as radios
function fetchAllMembers() {
    axios.get('http://localhost:5000/users/get')
    .then(response => {
        const userRadioDiv = document.getElementById('userRadio');

        response.data.forEach(user => {
            const radio = document.createElement('input');
            const label = document.createElement('label');

            radio.type = 'radio';
            radio.name = 'userID'; 
            radio.value = user._id.toString();

            label.htmlFor = radio.id;
            label.textContent = user.firstName + " " + user.surName; 

            const container = document.createElement('div');
            container.appendChild(radio);
            container.appendChild(label);
            userRadioDiv.appendChild(container);
        });
    })
    .catch(error => console.error(error));
}

// Function to fetch phones and render as checkboxes
function fetchAllPhones() {
    axios.get('http://localhost:5000/phones/get')
    .then(response => {
        const phoneCheckboxDiv = document.getElementById('phoneCheckbox');
        response.data.forEach(phone => {
            const checkbox = document.createElement('input');
            const label = document.createElement('label');

            checkbox.type = 'checkbox';
            checkbox.name = 'phoneBasket';
            checkbox.value = phone._id.toString();
            checkbox.id = phone._id.toString();

            label.htmlFor = checkbox.id;
            label.textContent = phone.manufacturer + " " + phone.model; 

            const container = document.createElement('div');
            container.appendChild(checkbox);
            container.appendChild(label);
            phoneCheckboxDiv.appendChild(container);
        });
    })
    .catch(error => console.error(error));
}


document.addEventListener('DOMContentLoaded', function() {
    fetchAllMembers(); 
    fetchAllPhones(); 
    refreshOrders(); // Refresh <table> when Page loaded
    var currentEditingOrderId = null; // Make sure to edit only one order


    // [Path 1 -- Create] -- Generate Random Phone - 'http://localhost:5000/phones/generate-phone'
    document.getElementById('generateRandomPhone').addEventListener('click', () => {  
        // Randomly check 1 Radio
        const radios = document.querySelectorAll('input[name="userID"]');
        if (radios.length > 0) {
            const randomRadioIndex = Math.floor(Math.random() * radios.length);
            radios.forEach((radio, index) => {
                radio.checked = index === randomRadioIndex;
            });
        }

        // Randomly check 1-3 Checkboxes
        const checkboxes = Array.from(document.querySelectorAll('input[name="phoneBasket"]'));
        if (checkboxes.length >= 1) {
            checkboxes.forEach(checkbox => checkbox.checked = false);    
            const countToCheck = Math.floor(Math.random() * Math.min(3, checkboxes.length)) + 1;
            
            // Random shuffle Array and select the first 1-3 Elements
            const shuffled = checkboxes.sort(() => 0.5 - Math.random()); 
            shuffled.slice(0, countToCheck).forEach(checkbox => checkbox.checked = true); 
        }
    });

    // [Path 2 - Get] -- Get all Orders - 'http://localhost:5000/orders/get'
    function refreshOrders() {
        axios.get('http://localhost:5000/orders/get')
        .then(response => {
            const orderList = document.getElementById('orderList');
            orderList.innerHTML = ''; // Clear Order Table
            
            response.data.forEach(currentOrder => {   
                const fullName = currentOrder.userID.firstName + " " + currentOrder.userID.surName;
                const phones = currentOrder.phoneBasket.map(
                    phone => phone.manufacturer + " " + phone.model
                ).join(", ");

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${currentOrder._id.toString()}</td> 
                    <td>${fullName}</td>  
                    <td>${phones}</td>
                    <td>
                        <a href="#" onclick="editOrder('${currentOrder._id.toString()}')">edit</a> / 
                        <a href="#" onclick="deleteOrder('${currentOrder._id.toString()}')">delete</a>
                    </td>
                `;
                orderList.appendChild(tr);
            });

            // [Default] - Select first Radio
            const radios = document.querySelectorAll('input[name="userID"]');
            if (radios.length > 0) radios[0].checked = true;            
        })
        .catch(error => console.error(error.message));      
    }

    // [Path 3 - POST] -- Create a Order - 'http://localhost:5000/orders/create'
    document.getElementById('createOrderButton').addEventListener('click', (event) => {
        event.preventDefault(); 

        // Populate `order` Object with the content of <form>
        let orderForm = document.getElementById('orderForm');
        var order = {
            phoneBasket : []
        };
        Array.from(orderForm.elements).forEach(field => {
            if (field.type === 'checkbox' && field.checked) {   
                order.phoneBasket.push(field.value);                 
            } else if (field.type === 'radio' && field.checked) {
                order[field.name] = field.value;
            }
            else if (field.type !== 'submit' && field.type !== 'checkbox' && field.type !== 'radio') {
                order[field.name] = field.value;
            }
        });

        if (order.phoneBasket.length < 1) {
            alert("User must purchase at least one Phone!");
            return; // Prevent Submission
        }          

        axios.post('http://localhost:5000/orders/create', order)
        .then(() => {
            refreshOrders(); // Refresh <table> after CREATE
            console.log(`Order created: `, order);
            orderForm.reset(); // Clear the form
        })
        .catch(error => console.error(error.message));
    });      


    // [Path 4 - GET] -- Get a Order - 'http://localhost:5000/orders/get/:orderId'
    window.editOrder = function(orderId) {             
        currentEditingOrderId = orderId;  // Change current Editing OrderId  

        axios.get(`http://localhost:5000/orders/get/${orderId}`)
        .then(response => {
            console.log("Get this Order", response.data); 
            let orderData = {...response.data}; // light copy, avoid changing the original data
            delete orderData._id; 
            delete orderData.__v; 
        
            // Fill the <form> with fetched Order
            let orderForm = document.getElementById('orderForm');                 
            Object.keys(orderData).forEach(key => {
                const element = orderForm.elements[key];  

                if(element instanceof NodeList){
                    if(element[0]?.type === 'checkbox'){
                        const checkboxValues = orderData[key].map(item => item._id);
                        document.querySelectorAll(`input[name="${key}"]`).forEach(checkbox => {
                            checkbox.checked = checkboxValues.includes(checkbox.value);
                        });
                    } else if (element[0]?.type === 'radio'){
                        const radioValue = orderData[key]._id;
                        document.querySelectorAll(`input[name="${key}"]`).forEach(radio => {
                            radio.checked = (radioValue === radio.value);
                        });
                    }                                                 
                } else {
                    element.value = orderData[key];
                }     
            });
        
            // Enable edit <button>, disable create <button>
            document.getElementById('editOrderButton').disabled = false;
            document.getElementById('createOrderButton').disabled = true;
        })
        .catch(error => console.error(error.message));      
    };


    // [Path 5 - PUT] -- Update a Order - 'http://localhost:5000/orders/update/:orderId'
    document.getElementById('editOrderButton').addEventListener('click',  (event) => {
        event.preventDefault();    

        // Populate `order` Object with the content of <form>
        let orderForm = document.getElementById('orderForm');
        var order = {
            phoneBasket : []
        };
        Array.from(orderForm.elements).forEach(field => {
            if (field.type === 'checkbox' && field.checked) {   
                order.phoneBasket.push(field.value);                 
            } else if (field.type === 'radio' && field.checked) {
                order[field.name] = field.value;
            }
            else if (field.type !== 'submit' && field.type !== 'checkbox' && field.type !== 'radio') {
                order[field.name] = field.value;
            }
        });

        if (order.phoneBasket.length < 1) {
            alert("User must purchase at least one Phone!");
            return; // Prevent Submission
        }    

        axios.put(`http://localhost:5000/orders/update/${currentEditingOrderId}`, order)
        .then((response) => {
            refreshOrders(); // Refresh <table> after UPDATE
            console.log(`Order: ${currentEditingOrderId} updated`, response.data);
            orderForm.reset(); // Clear the form
    
            // Disable edit <button>, enable create <button>
            document.getElementById('editOrderButton').disabled = true;
            document.getElementById('createOrderButton').disabled = false;
        })
        .catch(error => console.error(error.message));     
    });

    // [Path 6 -- DELETE] -- Delete a Order - 'http://localhost:5000/orders/delete/:modulId'
    window.deleteOrder = function(orderId) {             
        axios.delete(`http://localhost:5000/orders/delete/${orderId}`)
        .then(() => {
            console.log(`Order: ${orderId} deleted successfully`);
            refreshOrders(); // Refresh the list after deleting
        })
        .catch(error => console.error(error.message));
    };
}); // End of Load Page