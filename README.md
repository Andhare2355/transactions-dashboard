"MERN Stack Transaction Dashboard"



📋 Description

The Transaction Dashboard is a full-stack web application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It fetches transaction data from a third-party API and provides a powerful, interactive dashboard that allows users to analyze transactions for any selected month with rich features like search, pagination, visual statistics, bar charts, and pie charts.


🚀 Key Features

📥 1. Data Initialization API
Fetches transaction data from a third-party API (https://s3.amazonaws.com/roxiler.com/product_transaction.json).

Seeds the data into a MongoDB database.

Efficient schema to store product details like title, description, price, category, and date of sale.

🔍 2. Transaction Listing API
Supports search (by title, description, or price) and pagination.

Filters transactions based on the selected month (irrespective of year).

Default pagination: page=1, perPage=10.

📊 3. Statistics API
For the selected month:

Total sale amount

Total sold items

Total not sold items

📈 4. Bar Chart API

Returns count of items in different price ranges for the selected month:

0-100, 101-200, 201-300, ..., 901-above


🥧 5. Pie Chart API

Returns number of items in each unique category for the selected month.


🔄 6. Combined API

Fetches data from the statistics, bar chart, and pie chart APIs.

Returns a single combined response for improved frontend performance.

💻 Frontend Dashboard (React.js) 

🗂️ Transactions Table

Displays paginated list of transactions.

Dropdown to select month (default: March).

Search box to filter transactions by title, description, or price.

Dynamic fetching using backend API based on selected month and search input.

Next/Previous pagination controls.

📦 Transaction Statistics Box

Shows total sales, sold and unsold items using the statistics API.

📉 Price Range Bar Chart

Displays a bar chart with the number of transactions in different price ranges using bar chart API.

🧁 Category Pie Chart

Shows the distribution of categories as a pie chart for selected month using pie chart API.

🛠️ Tech Stack

Frontend: React.js, Axios, Chart.js (for graphs), TailwindCSS/Bootstrap (optional for styling)

Backend: Node.js, Express.js

Database: MongoDB

External API: JSON data from Roxiler

🎯 Use Case
This dashboard is ideal for businesses or analysts to monitor and visualize monthly product transactions in real-time, evaluate sales trends, and understand product category distribution effectively.
