CREATE TABLE dbo.Accounts (
    AccountId INT IDENTITY(1, 1) NOT NULL
        CONSTRAINT PK_Accounts PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(254) NOT NULL,
    CountryCode VARCHAR(5) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    PasswordHash VARCHAR(100) NOT NULL,
    TermsAcceptedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_Accounts_TermsAcceptedAt DEFAULT SYSUTCDATETIME(),
    CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_Accounts_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Accounts_Email UNIQUE (Email)
);
