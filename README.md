# Materialize NextJS reactive demo

This demonstration utilizes Materialize to create a reactive application in NextJS capable of handling arbitrarily complex SQL queries.

The process involves executing and serializing the query, storing it in memory via Redis, and assigning it a unique ID for identification. This ID, along with the query result is used to server side render the page. After the page has been loaded and hydrated, the client subscribes to changes related to the specific query ID. Any alterations within the database that impact the outcome of the particular query will trigger a server-sent event. The client, in response, dynamically re-renders using the most recently computed result.
