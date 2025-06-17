'use strict';

// Select the classification dropdown by its ID
const classificationList = document.querySelector("#classificationList");

if (classificationList) {
  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);

    const classIdURL = "/inv/getInventory/" + classification_id;

    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Network response was not OK");
      })
      .then(function (data) {
        console.log(data);
        buildInventoryList(data);
      })
      .catch(function (error) {
        console.log('There was a problem: ', error.message);
      });
  });
}

/**
 * Builds an HTML table with the inventory data and injects it into the page.
 * @param {Array} data - The inventory data array.
 */
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  if (!inventoryDisplay) return;

  // If no data, show message
  if (!Array.isArray(data) || data.length === 0) {
    inventoryDisplay.innerHTML = `<tr><td colspan="4">No inventory items found.</td></tr>`;
    return;
  }

  // Build table header and rows
  let tableHTML = `
    <thead>
      <tr>
        <th>Vehicle</th>
        <th>Price</th>
        <th>Mileage</th>
        <th>Color</th>
      </tr>
    </thead>
    <tbody>
  `;

  data.forEach(vehicle => {
    tableHTML += `
      <tr>
        <td><a href="/inv/detail/${vehicle.inv_id}">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</a></td>
        <td>$${Number(vehicle.inv_price).toLocaleString()}</td>
        <td>${Number(vehicle.inv_miles).toLocaleString()}</td>
        <td>${vehicle.inv_color}</td>
      </tr>
    `;
  });

  tableHTML += "</tbody>";

  inventoryDisplay.innerHTML = tableHTML;
}


// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
 let inventoryDisplay = document.getElementById("inventoryDisplay"); 
 // Set up the table labels 
 let dataTable = '<thead>'; 
 dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
 dataTable += '</thead>'; 
 // Set up the table body 
 dataTable += '<tbody>'; 
 // Iterate over all vehicles in the array and put each in a row 
 data.forEach(function (element) { 
  console.log(element.inv_id + ", " + element.inv_model); 
  dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
  dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
  dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
 }) 
 dataTable += '</tbody>'; 
 // Display the contents in the Inventory Management view 
 inventoryDisplay.innerHTML = dataTable; 
}
