const users = [];
// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room){
        return {
            error: "Username and room are required"
        }
    }

    const existingUser = users.find((user) => {
        return user.username === username;
    });

    if(existingUser){
        return {
            error: "Username is in use!"
        }
    }

    const user = {id, username, room};
    users.push(user);
    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
};

// console.log(users);
// user = {
//     id: 1,
//     username: "jagdish",
//     room: "node"
// };
// addUser(user);
// // console.log(users);

// user = {
//     id: 2,
//     username: "jagdish2",
//     room: "node2"
// };
// addUser(user);
// // console.log(removeUser(1));
// console.log(users);
// // console.log(getUser(3));
// const list = getUsersInRoom('node2');
// console.log(list);

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}