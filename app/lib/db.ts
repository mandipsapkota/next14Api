import mongoose, { ConnectOptions } from "mongoose";

const MongoUrl = process.env.MONGO_URL;

const connectToDb = async () => {
    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("Already connected to the database.");
        return;
    }

    if (connectionState === 2) {
        console.log("Currently connecting to the database...");
        return;
    }

    try {
        const options: ConnectOptions = {
            dbName: "next14restapi",
            bufferCommands: true,
        };

        await mongoose.connect(MongoUrl!, options);
        console.log("Connected to the database successfully.");
        
    } catch (error: any) {
        console.error("Error connecting to the database:", error.message);
        throw new Error(error.message);
    }
};

export default connectToDb;
