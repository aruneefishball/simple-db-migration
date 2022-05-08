BEGIN
    DECLARE @migrations TABLE
                        (
                            step       VARCHAR(10),
                            hash       VARCHAR(64),
                            identifier VARCHAR(255)
                        );

    IF exists(SELECT *
              FROM INFORMATION_SCHEMA.TABLES
              WHERE TABLE_NAME = N'__migration')
        BEGIN
            INSERT INTO @migrations
            SELECT *
            FROM __migration
            ORDER BY step
        END
    ELSE
        BEGIN
            CREATE TABLE __migration
            (
                step       VARCHAR(10)  NOT NULL PRIMARY KEY,
                hash       VARCHAR(64)  NOT NULL,
                identifier VARCHAR(255) NOT NULL
            )
        END;

    SELECT * FROM @migrations
END