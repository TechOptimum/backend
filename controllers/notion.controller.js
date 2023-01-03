const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;


exports.readInternshipFinderData = async (req, res) => {
  const response = await notion.databases.query({ database_id: databaseId });
  console.log(response);
  res.send({response})
}