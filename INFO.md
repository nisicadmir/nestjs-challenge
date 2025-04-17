# Search

I added a key-set pagination value where user will provide limit, sortBy and sortOrder parameters.
Regarding the filters for Q parameters, when using regex includes (without start with) then MongoDB does not use any index.
In order for MongoDB to use index we must use startsWith (^) filter.
In real world situation we should check how slow is the filter for 100k items being searched on this way.
I added couple of indexes to cover all use cases.
For items which do not have tracks set I created a script which will populate the data. Script can be run with npm run script_01. This script can be run multiple times.
In the script I used pagination as well because it would be hard to fetch all 100k items (or more) at once.

# Create

Nothing to mention here.

# Update

Nothing to mention here.

# Models

I put all the models inside schemas folder however this could be separated more into schemas/models.

# Orders

I used transactions in order to create orders and to match the quantity with the number of orders. If transaction is not used then we might end up with orders being created without quantity not reduces.

# General

I added a repository pattern where we will have find, create and other methods at one place so we do not want to write everything again (error handling).
I did not care much about error messages or the type of error it is returned.
I did not use services much but used controllers hence the logic is simple so I did not want to use much of the services.

# Tests

I did not write any test. I write a lot test at work :)
