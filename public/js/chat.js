const socket = io();
// Elements
const $chatform = document.querySelector("#chatform");
const $messagebox = $chatform.querySelector("input");
const $sendbtn = $chatform.querySelector("#send");
const $sendlocationbtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messagetemplate = document.querySelector("#message-template").innerHTML;
const locationmessagetemplate = document.querySelector("#locationmessage-template").innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerheight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerheight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
};

$chatform.addEventListener('submit', (e) => {
    e.preventDefault();
    $sendbtn.setAttribute("disabled", "disabled");
    socket.emit('message', e.target.elements.message.value);
});
socket.on('message', (message) => {
    console.log(`message: ${message}!`);
    $sendbtn.removeAttribute("disabled");
    $messagebox.value = '';
    $messagebox.focus();
    const html = Mustache.render(messagetemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();

});
socket.on('sendlocation', (message) => {
    console.log(location);
    const html = Mustache.render(locationmessagetemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

$sendlocationbtn.addEventListener('click', (e) => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by tour browser!');
    }
    $sendlocationbtn.setAttribute("disabled", "disabled");
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, (message) => {
            console.log(message);
            $sendlocationbtn.removeAttribute("disabled");
        });
    });
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});