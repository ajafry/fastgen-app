from fastapi import APIRouter
import aiofiles
from fastapi.responses import JSONResponse
import os

# test data
people_data = [{"id":1,"firstName":"Aili","lastName":"Beadham","email":"abeadham0@salon.com","gender":"Genderqueer","dateOfBirth":"10/31/2003"},
{"id":2,"firstName":"Willdon","lastName":"Blasius","email":"wblasius1@toplist.cz","gender":"Male","dateOfBirth":"01/14/2007"},
{"id":3,"firstName":"Jen","lastName":"Limer","email":"jlimer2@addthis.com","gender":"Female","dateOfBirth":"11/17/2010"},
{"id":4,"firstName":"Murdock","lastName":"Scandrite","email":"mscandrite3@answers.com","gender":"Male","dateOfBirth":"12/02/2002"},
{"id":5,"firstName":"D'arcy","lastName":"Mattingley","email":"dmattingley4@cpanel.net","gender":"Male","dateOfBirth":"10/29/1999"},
{"id":6,"firstName":"Barret","lastName":"Sharman","email":"bsharman5@sohu.com","gender":"Male","dateOfBirth":"04/17/2000"},
{"id":7,"firstName":"Antonius","lastName":"Claxton","email":"aclaxton6@census.gov","gender":"Male","dateOfBirth":"08/05/2008"},
{"id":8,"firstName":"Kristina","lastName":"Redmile","email":"kredmile7@goodreads.com","gender":"Female","dateOfBirth":"11/14/1992"},
{"id":9,"firstName":"Papageno","lastName":"Smitherman","email":"psmitherman8@bbb.org","gender":"Male","dateOfBirth":"07/14/1993"},
{"id":10,"firstName":"Blondie","lastName":"Vockings","email":"bvockings9@omniture.com","gender":"Female","dateOfBirth":"03/13/2010"}]

peopleRouter = APIRouter(
    prefix="/api/people",
    responses={404: {"description": "Endpoint not found"}}
)

@peopleRouter.get("/", summary="Show the entire people data")
async def get_people():
    # file_path = os.path.join(os.path.dirname(__file__), "people.js")

    # async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
    #     content = await f.read()
    return JSONResponse(content=people_data)

@peopleRouter.get("/{id}", summary="Find a person by ID")
async def get_people_by_id(id):
    person = next((p for p in people_data if p["id"] == int(id)), None)
    if person:
        return JSONResponse(content=person)
    return JSONResponse(content={"info": "Person not found"}, status_code=404)