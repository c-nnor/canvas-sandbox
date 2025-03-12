
class CameraIcon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 75;
        this.height = 75;
        this.dragging = false;
        this.image = new Image();
        this.image.src = 'assets/camera_v2.svg';
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    isMouseOver(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height;
    }
};

class LockIcon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.dragging = false;
        this.image = new Image();
        this.image.src = 'assets/lock_v2.svg';
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    isMouseOver(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height;
    }
};



const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const background = new Image();
background.src = 'assets/floorplan.png'; // Background image

let scale = 1, offsetX = 0, offsetY = 0;
let isPanning = false;
let lastX, lastY;
let draggedObject = null;
// Vars for the last valid position of an icon
let lastValidX, lastValidY;
let cameraIcons = [new CameraIcon(100, 100)];
let lockIcons = [new LockIcon(300, 200)];

background.onload = function () {
    draw();
};

function draw() {
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    ctx.clearRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);
    ctx.drawImage(background, 0, 0, background.width, background.height);

    // Draw icons
    cameraIcons.forEach(icon => icon.draw(ctx));
    lockIcons.forEach(icon => icon.draw(ctx));
};

function getMousePos(evt) {
    return {
        x: (evt.clientX - offsetX) / scale,
        y: (evt.clientY - offsetY) / scale,
    };
};

canvas.addEventListener('mousedown', (e) => {
    let mouse = getMousePos(e);

    draggedObject = [...cameraIcons, ...lockIcons].find(obj => obj.isMouseOver(mouse.x, mouse.y));

    if (draggedObject) {
        draggedObject.dragging = true;
    } else {
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        document.getElementById('control-panel').style.opacity = "0";
    }
    canvas.style.cursor = "grabbing";
});

canvas.addEventListener('mousemove', (e) => {
    let mouse = getMousePos(e);

    if (draggedObject && draggedObject.dragging) {
        draggedObject.x = mouse.x - draggedObject.width / 2;
        draggedObject.y = mouse.y - draggedObject.height / 2;

        // Get the full array of icons for manipulation
        let allIcons = cameraIcons.concat(lockIcons);
        // 
        if (checkOverlap(draggedObject, allIcons)) {
            // If an overlap is detected revert to last valid position
            draggedObject.x = lastValidX;
            draggedObject.y = lastValidY;
        } else {
            lastValidX = draggedObject.x;
            lastValidY = draggedObject.y;
        }
        draw();
    } else if (isPanning) {
        let dx = e.clientX - lastX;
        let dy = e.clientY - lastY;
        offsetX += dx;
        offsetY += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggedObject) draggedObject.dragging = false;
    isPanning = false;
    draggedObject = null;
    document.getElementById('control-panel').style.opacity = "1";
    canvas.style.cursor = "grab";
});

canvas.addEventListener('mouseleave', () => {
    isPanning = false;
    if (draggedObject) draggedObject.dragging = false;
    draggedObject = null;
    canvas.style.cursor = "grab";
});

// Zoom with scroll
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    let zoomIntensity = 0.1;
    let newScale = scale + (e.deltaY > 0 ? -zoomIntensity : zoomIntensity);
    newScale = Math.max(0.3, Math.min(2, newScale));

    let mouseX = e.clientX - canvas.offsetLeft;
    let mouseY = e.clientY - canvas.offsetTop;
    offsetX -= (mouseX - offsetX) * (newScale - scale);
    offsetY -= (mouseY - offsetY) * (newScale - scale);

    scale = newScale;
    draw();
});

// Reference for me - Please dont delete yet - OT
// ----------------------------------------------

// // deleting an icon
// let deleteMode = false;

// canvas.addEventListener('contextmenu', (e) => {
//     e.preventDefault(); // Prevent the default context menu

//     let mouse = getMousePos(e);

//     // Checking if click was on a camera icon
//     let clickedCamera = cameraIcons.find((obj) => obj.isMouseOver(mouse.x, mouse.y));
//     if (clickedCamera) {
//         // Removing the clicked camera icon
//         cameraIcons = cameraIcons.filter((obj) => obj !== clickedCamera);
//         draw(); // Redrawing the container
//         return;
//     }

//     // Checking if clicked was on a lock icon
//     let clickedLock = lockIcons.find((obj) => obj.isMouseOver(mouse.x, mouse.y));
//     if (clickedLock) {
//         // Removing the clicked lock icon
//         lockIcons = lockIcons.filter((obj) => obj !== clickedLock);
//         draw(); // Redrawing the container
//         return;
//     }
// });


let selectedIcon = null; // Store the selected icon

document.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Preventing the systems default right-click menu

    let mouse = getMousePos(e);
    selectedIcon = [...cameraIcons, ...lockIcons].find(obj => obj.isMouseOver(mouse.x, mouse.y));

    if (selectedIcon) {
        // Showing the menu where the mouse is on the screen
        const menu = document.getElementById("contextMenu");
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        menu.style.display = "block";
    }
    else {
        closeContextMenu(); // closing the menu when the 
    }
});// Context Menu END

// Function to close menu when clicking elsewhere
document.addEventListener("click", () => {
    closeContextMenu();
});

// Function to close menu on icon
function closeContextMenu() {
    document.getElementById("contextMenu").style.display = "none";
};

// Deleting the selected icon
function deleteIcon() {
    if (selectedIcon) {
        cameraIcons = cameraIcons.filter(obj => obj !== selectedIcon);
        lockIcons = lockIcons.filter(obj => obj !== selectedIcon);
        draw();
        closeContextMenu();
    }
};

// Menu option 2 - Likely going to be changing icon/class
function changeIcon() {
    // console.log("Option 2 - Change icon option");
    if (!selectedIcon) {
        return;
    }
    else if (cameraIcons.includes(selectedIcon)) {
        // Swap from camera to lock
        cameraIcons = cameraIcons.filter(obj => obj !== selectedIcon);
        const newLock = new LockIcon(selectedIcon.x, selectedIcon.y);
        lockIcons.push(newLock);
    }
    else if (lockIcons.includes(selectedIcon)) {
        // Swap from lock to camera
        lockIcons = lockIcons.filter(obj => obj !== selectedIcon);
        const newCamera = new CameraIcon(selectedIcon.x, selectedIcon.y);
        cameraIcons.push(newCamera);
    }

    // if(selectedIcon.Image=='assets/lock_v2.svg')

    draw()
    closeContextMenu();
};

// Menu option 3 - likely going to be changing the colour/ grouping
function option3() {
    console.log("Option 3 - Potenital change colour/ grouping option");
    closeContextMenu();
};


function addCameraIcon() {
    const newCamera = new CameraIcon((canvas.width / 2 - 25) / scale, (canvas.height / 2 - 25) / scale);
    const allIcons = cameraIcons.concat(lockIcons);
    if(!checkOverlap(newCamera, allIcons)){
        cameraIcons.push(newCamera);
        draw();
    }else{
        // generate a random number between -50 and 100
        const randomShift = () => Math.floor(Math.random() * (300 + 1)) - 100   ;
        let placed = false;
        let attempts = 0;
        let maxAttempts = 10;
        // If the space is taken run through icons and find a space that isnt taken
        while(!placed && attempts < maxAttempts){
            const newIconX = newCamera.x + randomShift();
            const newIconY = newCamera.y + randomShift();
            const newCamera2 = new CameraIcon(newIconX, newIconY);
            console.log("icon created")
            if(!checkOverlap(newCamera2, allIcons)){
                cameraIcons.push(newCamera2);
                draw();
                console.log("icon placed")
                placed = true;
            }else{
                attempts++;
            }
        }
        if (!placed) {
            console.log("Failed to place the icon after multiple attempts");
        }
    }
};

function addLockIcon() {
    const newLock = new LockIcon((canvas.width / 2 - 25) / scale, (canvas.height / 2 - 25) / scale);
    
    const allIcons = cameraIcons.concat(lockIcons);
    if(!checkOverlap(newLock, allIcons)){
        lockIcons.push(newLock);
        draw();
    }else{
        // generate a random number between -100 and 100
        const randomShift = () => Math.floor(Math.random() * (300 + 1)) - 100;

        let placed = false;
        let attempts = 0;
        let maxAttempts = 10;

        while(!placed && attempts < maxAttempts){
            console.log("starting runing through icons")
            const newIconX = newLock.x + randomShift();
            const newIconY = newLock.y + randomShift();
            const newLock2 = new LockIcon(newIconX, newIconY);
            console.log("icon created")
            if(!checkOverlap(newLock2, allIcons)){
                lockIcons.push(newLock2);
                draw();
                console.log("icon placed")
                placed = true;
            }else{
                attempts++;
            }
        }
        if (!placed) {
            console.log("Failed to place the icon after multiple attempts");
        }
    }
};

function changeImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            background.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

function openHelpPopup() {
    let overlay = document.getElementById("overlay");
    let helpPopup = document.getElementById("helpPopup");
    if (overlay.style.display === "none" || overlay.style.display === "") {
        overlay.style.display = "block";
        helpPopup.style.display = "block";
    } else {
        overlay.style.display = "none";
        helpPopup.style.display = "none";
    }
};

document.getElementById("btnPopupClose").addEventListener('click', function () {
    document.getElementById('overlay').style.display = "none";
    document.getElementById("helpPopup").style.display = "none";
});

// Close popup when clicking on the overlay
document.getElementById("overlay").addEventListener("click", function () {
    this.style.display = "none";
    document.getElementById("helpPopup").style.display = "none";
});

window.onload = function () {
    console.log("Window loaded...")
    openHelpPopup(); // Call the function to show the popup when the page loads
};

// Logic for checking icons don't overlap
function checkOverlap(currentIcon, existingIcons) {
    console.log("\nChecking overlap...")
    for (let icon of existingIcons) {
        if (currentIcon !== icon &&
            // check the x and y axis dont match
            // We can do this by checking the x value of existing icons plus the width is less than the selected icons x value plus its with
            currentIcon.x < icon.x + icon.width &&
            currentIcon.x + currentIcon.width > icon.x &&
            currentIcon.y < icon.y + icon.height &&
            currentIcon.y + currentIcon.height > icon.y
        ) {
            // There is an overlap so returning true
            console.log("overlapping icon")
            return true;
        }
    }
    // There is no overlap
    return false;
};

function clearIcons (){
    // Set the camera and lock icons to empty arrays to wipe all assets
    cameraIcons.length = 0;
    lockIcons.length = 0;
    // Redraw the canvas        // generate a random number between -100 and 100
        const randomShift = () => Math.floor(Math.random() * (200 + 1)) - 150;
    draw();
}