console.log("poop fart!");

const fetchCrafts = async () => {
    try {
        let response = await fetch("/api/crafts");
        let craftsData = await response.json();
        let craftGallery = document.getElementById("craft-gallery");
        craftGallery.innerHTML = "";

        craftsData.forEach((craft) => {
            let section = document.createElement("section");
            craftGallery.append(section);

            let img = document.createElement("img");
            img.src = `/uploads/${craft.img}`; // Fixed image path
            img.className = "craft-image";
            img.onclick = () => displayCraftDetails(craft);
            section.append(img);
        });

        let addCraftButton = document.createElement("button");
        addCraftButton.textContent = "Add New Craft";
        addCraftButton.onclick = openCraftForm;
        craftGallery.append(addCraftButton);
    } catch (error) {
        console.error("Error fetching crafts:", error);
    }
};

const displayCraftDetails = (craft) => {
    openDialog("craft-details");
    const craftDetails = document.getElementById("craft-details");
    craftDetails.innerHTML = "";
    craftDetails.classList.remove("hidden");

    const h3 = document.createElement("h3");
    h3.innerHTML = craft.name;
    craftDetails.append(h3);

    const dLink = document.createElement("a");
    dLink.innerHTML = "&#9249;";
    craftDetails.append(dLink);
    dLink.id = "delete-link";

    const eLink = document.createElement("a");
    eLink.innerHTML = "&#9998;";
    craftDetails.append(eLink);
    eLink.id = "edit-link";

    const p = document.createElement("p");
    craftDetails.append(p);
    p.innerHTML = craft.description;

    const ul = document.createElement("ul");
    craftDetails.append(ul);
    console.log(craft.supplies);
    craft.supplies.forEach((supply) => {
        const li = document.createElement("li");
        ul.append(li);
        li.innerHTML = supply;
    });

    eLink.onclick = showCraftForm;
    dLink.onclick = removeCraft.bind(this, craft);
    populateCraftForm(craft);
};

const populateCraftForm = (craft) => {
    const form = document.getElementById("craft-form");
    form.craft_id.value = craft._id;
    form.craft_name.value = craft.name;
    form.description.value = craft.description;
    document.getElementById("img-preview").src = `/uploads/${craft.img}`; // Fixed image path
    populateSupplies(craft.supplies);
};

// Other functions remain unchanged

document.getElementById("craft-form").onsubmit = addEditCraft;
document.getElementById("add-link").onclick = showCraftForm;
document.getElementById("add-supply").onclick = addSupply;

document.getElementById("img").onchange = (e) => {
    if (!e.target.files.length) {
        document.getElementById("img-preview").src = "";
        return;
    }
    document.getElementById("img-preview").src = URL.createObjectURL(
        e.target.files.item(0)
    );
};

const addSupply = (e) => {
    e.preventDefault();
    const section = document.getElementById("supply-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
};

const addEditCraft = async (e) => {
    e.preventDefault();
    const form = document.getElementById("craft-form");
    const formData = new FormData(form);
    let response;
    formData.append("supplies", getSupplies());

    //add request
    if (form.craft_id.value.trim() == "") {
        response = await fetch("/api/crafts", {
            method: "POST",
            body: formData,
        });
    } else {
        //put request
        response = await fetch(`/api/crafts/${form.craft_id.value}`, {
            method: "PUT",
            body: formData,
        });
    }

    //successfully got data from server
    if (response.status != 200) {
        const { errors } = await response.json();
        displayErrors(errors);
        return;
    }

    await response.json();
    resetForm();
    document.getElementById("dialog").style.display = "none";
    fetchCrafts();
};

const getSupplies = () => {
    const inputs = document.querySelectorAll("#supply-boxes input");
    let supplies = [];

    inputs.forEach((input) => {
        supplies.push(input.value);
    });

    return supplies;
};

const displayErrors = (errors) => {
    alert(errors.join("\n"));
};
