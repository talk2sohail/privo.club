---
name: Project Overview
description: understanding of the codebase archotecture
invokable: true
---

backend: /backend
    - written in Go
    - uses sqlx and pg driver for postgres integration

frontend: ./src
    - written in NextJs and Typescript

migration: /backend/migrations
    - contains sql files for migration
    - a Go tool is written to apply the migration present inside backend/cmd/migrate folder
    

