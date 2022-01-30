const ini = () => {
	const tableBody = document.querySelector(".table-body");
	const nav = document.querySelector(".nav-container");
	const sortButtons = document.querySelectorAll(".button-sort");
	const showColsButton = document.querySelector(".show-button");
	const hideColButtons = document.querySelectorAll(".hide-icon");

	const appendForm = document.querySelector(".append-form");
	const appendBtn = appendForm.querySelector(".append-button");
	const cancelBtn = appendForm.querySelector(".cancel-button");
	const inputs = appendForm.querySelectorAll(".text-input, .textarea");

	const rowsPerPage = 10; //determaines the number of rows rendered on the table
	const dbURL = document.URL + "db/db.json"; //url to a database

	//renderes table rows from data
	const renderPage = (data) => {
		tableBody.innerHTML = ``;
		data.forEach((item) => {
			const tableRow = document.createElement("tr");
			tableRow.classList.add("table-row");
			tableRow.id = item.id;
			tableRow.innerHTML = `
			<td class="table-cell col-first-name">${item.firstName}</td>
			<td class="table-cell col-last-name">${item.lastName}</td>
			<td class="table-cell col-about">${item.about}</td>
			<td class="table-cell col-eye-color">
			<div class="eye" id=${item.eyeColor} style="border: 15px solid ${item.eyeColor}">
			${item.eyeColor}
				</div>
			</td>
			
		`;
			tableBody.append(tableRow);
			//when tabel row is clicked, shows append form and loads input values from table row to the form
			tableRow.addEventListener("click", (event) => {
				inputs.forEach((input, i) => {
					input.value = tableRow.children[i].textContent.trim();
				});
				appendForm.style.display = "block";
			});
		});
		return data;
	};
	// renderes navigation buttons
	const renderNav = (pages) => {
		nav.innerHTML = "";
		for (let index = 0; index < pages; index++) {
			const navBtn = document.createElement("button");
			navBtn.classList.add("button");
			navBtn.classList.add("nav-button");
			navBtn.id = index;
			navBtn.textContent = index + 1;
			if (index === 0) navBtn.classList.add("nav-button-selected");
			//returns array of siblings of elment "e"
			const getSiblings = (e) => {
				// for collecting siblings
				const siblings = [];
				// if no parent, return no sibling
				if (!e.parentNode) {
					return siblings;
				}
				// first child of the parent node
				let sibling = e.parentNode.firstChild;
				// collecting siblings
				while (sibling) {
					if (sibling.nodeType === 1 && sibling !== e) {
						siblings.push(sibling);
					}
					sibling = sibling.nextSibling;
				}
				return siblings;
			};
			navBtn.addEventListener("click", (event) => {
				if (!event.target.classList.contains("nav-button-selected")) {
					event.target.classList.add("nav-button-selected");
					getSiblings(event.target).forEach((item) =>
						item.classList.remove("nav-button-selected")
					);
				}
			});
			nav.append(navBtn);
		}
	};
	//renders table from passed data array and navigation buttons if nessesery
	const renderTable = (data, page) => {
		let newData;
		if (Array.isArray(data[0])) {
			newData = page >= 0 ? data[page] : data[0];
			renderNav(data.length);
		} else {
			newData = data;
		}
		renderPage(newData);
		return data;
	};

	//sorts data array of objects by value in ascending alphabetical order.
	//returns sorted array
	const sortTableAsc = (data, value) => {
		const newArr = [...data];
		newArr.sort((a, b) => {
			if (a[value] < b[value]) {
				return 1;
			}
			if (a[value] > b[value]) {
				return -1;
			}
			return 0;
		});
		return newArr;
	};
	//sorts data array of objects by value in descending alphabetical order.
	//returns sorted array
	const sortTableDes = (data, value) => {
		const newArr = [...data];
		newArr.sort((a, b) => {
			if (a[value] < b[value]) {
				return -1;
			}
			if (a[value] > b[value]) {
				return 1;
			}
			return 0;
		});
		return newArr;
	};

	//saves db.json to browser`s local storage as "users".
	//Returns array of objects containing data from db.json.
	// Deletes id, phone and name fields. adds firstName and lastName fields contaning corresponding info from name object.
	const getData = (rowsPerPage) => {
		if (!localStorage.hasOwnProperty("users")) {
			fetch(dbURL)
				.then((res) => res.json())
				.then((data) => {
					const arr = data.map((item) => {
						delete item.phone;
						item.firstName = item.name.firstName;
						item.lastName = item.name.lastName;
						delete item.name;
						return item;
					});
					if (!rowsPerPage || rowsPerPage >= arr.length) {
						localStorage.setItem("users", JSON.stringify(arr));
					} else {
						//rearranges data into 2-dimensional array with "rowsPerPage" elements in subarray
						localStorage.setItem(
							"users",
							JSON.stringify(
								arr.reduce((sum, item, i) => {
									if (i % rowsPerPage === 0) {
										sum.push([item]);
									} else {
										sum[Math.floor(i / rowsPerPage)].push(
											item
										);
									}
									return sum;
								}, [])
							)
						);
					}
				});
			window.location.reload();
		}

		return renderTable(JSON.parse(localStorage.getItem("users")));
	};

	const users = getData(rowsPerPage);
	// hides column "col" from the table
	const hideColumn = (col) => {
		const tableRows = document.querySelectorAll(".table-row");
		if (tableRows[0].children[col]) {
			tableRows.forEach((item) => {
				item.children[col].style.display = "none";
			});
		}
	};
	// shows column "col" from the table
	const showColumn = (col) => {
		const tableRows = document.querySelectorAll(".table-row");
		if (tableRows[0].children[col]) {
			tableRows.forEach((item) => {
				item.children[col].style.display = "";
			});
		}
	};

	//when button is clicked, hides append form and clears input values of the form
	[appendBtn, cancelBtn, ...nav.children].forEach((button) => {
		button.addEventListener("click", (event) => {
			event.preventDefault();
			inputs.forEach((item) => {
				item.value = "";
			});
			appendForm.style.display = "none";
		});
	});
	// shows a corresponding page
	nav.querySelectorAll("button").forEach((button) => {
		button.addEventListener("click", (event) => {
			if (event.target.classList.contains("nav-button-selected")) {
				renderPage(users[event.target.id]);
			}
			sortButtons.forEach((button) => {
				button.classList.remove("button-sort-rev");
			});
		});
	});
	// alphabeticly sorting table colomns
	sortButtons.forEach((item) => {
		item.addEventListener("click", (event) => {
			let page = nav.querySelector(".nav-button-selected").id; //looks up id of selected page
			if (!event.target.classList.contains("button-sort-rev")) {
				renderPage(sortTableDes(users[page], event.target.id));
				event.target.classList.add("button-sort-rev");
			} else {
				renderPage(sortTableAsc(users[page], event.target.id));
				event.target.classList.remove("button-sort-rev");
			}
		});
	});

	//hide column
	hideColButtons.forEach((button) => {
		button.addEventListener("click", (event) => {
			hideColumn(event.target.parentNode.id);
			showColsButton.style.display = "block";
		});
	});

	// show all hidden columns if shoBtn is pressed.
	//if navbtn is pressed maintain hidden columns
	[showColsButton, ...nav.children].forEach((button) => {
		const tableRows = document.querySelectorAll(".table-row");
		button.addEventListener("click", (event) => {
			tableRows[0].querySelectorAll("th").forEach((col) => {
				if (col.style.display === "none") {
					if (event.target.classList.contains("nav-button")) {
						hideColumn(col.id);
					} else {
						showColsButton.style.display = "none";
						showColumn(col.id);
					}
				}
			});
		});
	});
};
ini();
