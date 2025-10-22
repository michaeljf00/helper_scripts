import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express()

app.use(bodyParser.json());

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DB_ID = process.env.NOTION_DB_ID;
const CLICKUP_USER_ID = process.env.CLICKUP_USER_ID; 

app.post("/notion-to-clickup", async (req, res) => {
    const event = req.body;
    console.log(event);

    const assignees = event.task?.assignees || [];
    
    if (!assignees.some(a => a.id.toString() === CLICKUP_USER_ID))
        return res.sendStatus(200).send("User not assigned to task");

    const data = {
        parent: { database_id: NOTION_DB_ID },
        properties: {
            "Project Name": {},
            "Status": {},
            "Owner": {},
            "Priority": {},
            "ClickUp Link": {},
            "Date Created": {},
            "Date Last Updated": {}
        }
    };

    try {
        await axios.post("https://api.notion.com/v1/pages", data, {
            headers: {
                "Authorization": `Bearer ${NOTION_API_KEY}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
            }
        });
        res.sendStatus(200);
    } catch (error) {
        console.error("Error creating Notion entry:", error.response?.data || error.message);
        res.sendStatus(500).send("Error creating Notion entry");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});