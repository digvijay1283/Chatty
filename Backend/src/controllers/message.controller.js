import User from "../models/user.model.js"; // Import the User model
import Message from "../models/message.model.js"; // Import the Message model

export const getUsersForSidebar =async (req,res) =>{
    try{
        const loggedInUser = req.user.__id;
        const filteredUsers=await User.find({_id: {$ne: loggedInUser}}).select("-password ");
        // the above function tell the mongoos to fetwch everyones data except the ourselves for the sodebar , and all the data wil be fetched except the password and ;

        res.status(200).json(filteredUsers);

    }
    catch(error){
        console.log("Error in getUsersForSidebar controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


// the below function will fetch the messages between the two users , and it will return the messages in the form of array of objects , where each object will contain the message data , like senderId, receiverId, message, timestamp etc.
export const getMessages = async (req, res) => {
    try{
        const {id:userToChatId}=req.params
        const myId=req.user._id;
        // Fetch messages between the logged-in user and the user they want to chat with

        const messages = await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })

        res.status(200).json(messages);
    } catch(error){
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
   try{
    const {text,image}=req.body;
    const {id:receiverId}=req.params;
    const senderId=req.user._id;

    let imageUrl;
    if(image){
        // upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image

    }
    const newMessage=new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl, // Use the image URL if an image is provided
    });

    await newMessage.save();
    res.status(201).json(newMessage);

    // todo :real time functionality will happen here i.e with socket io

   }catch(error){
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
   }
};

