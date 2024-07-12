import Rooms from "../model/Rooms";
import user from "../model/user";
import doctor from "../model/doctor";


const roomHandler = (socket) => {
    socket.on('create-room', async ({ Id, roomName, newMeetType, newMeetDate, newMeetTime }) => {
        const newRoom = new Rooms({
            roomName: roomName,
            host: Id,
            meetType: newMeetType,
            meetDate: newMeetDate,
            meetTyme: newMeetTime,
            participants: [],
            currentParticipants: []
        });
        const room = await newRoom.save();
        await socket.emit("room-created", { roomId: room._id, meetType: newMeetType });
    });

    socket.on('user-code-join', async ({ roomId }) => {
        const room = await Rooms.findOne({ _id: roomId });
        if (room) {
            await socket.emit("room-exists", { roomId });
        }
        else {
            socket.emit("room-not-exist")
        }
    })

    socket.on('request-to-join-room', async ({ roomId, Id }) => {
        const room = await Rooms.findOne({ _id: roomId });
        if (Id === room.host) {
            socket.emit('join-room', { roomId, Id })
        }
        else {
            socket.emit(requesting - host, { Id });
            socket.broadcast.to(roomId).emit('user-requested-to-join', { participantId: Id, hostId: room.hc })
        }
    });

    socket.on('join-room', async ({ roomId, Id }) => {
        await Rooms.updateOne({ _id: roomId }, { $addToSet: { participants: Id } });
        await Rooms.updateOne({ _id: roomId }, { $addToSet: { currentParticipants: Id } });
        await socket.join(roomId);
        console.log(`user : ${userId} join room: ${roomId}`);
        await socket.brodcast.to(roomId).emit("user-joined", { Id })
    });

    socket.on("get-participants", async ({ roomId }) => {
        const room = await Rooms.findOne({ _id: roomId });
        const roomName = room.roomName;
        const participants = room.currentParticipants;
        const usernames = {};

        const users = await user.find(
            { _id: { $in: participants } },
            { _id: 1, username: 1 }
        ).exec();

        users.forEach(user => {
            const { _id, username } = user;
            usernames[_id.valuof().toString()] = username;
        });

        socket.emit("participants-list", { usernames, roomName });
    });


    socket.on("fetch-my-meets", async ({ Id }) => {
        const meets = await Rooms.find({ host: Id }, {
            _id: 1, roomName: 1, meetType: 1, meetDate: 1,

        })
    })
}