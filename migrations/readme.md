# Guide

## To put sql in this folder

+ Prefix by `XXXX_<SHORT_DESCRIPTION>.sql` `X` should be a number for readability
+ Program only scan for `.sql`

## Note

+ for multiple statement in single file
    + safe if any statement won't fail
    + if some statement will fail please split into multiple file

## Implementation note

+ If migrated sql was change it will fail due to prevent undefined behavior