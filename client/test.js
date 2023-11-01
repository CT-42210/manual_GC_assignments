            const templates = [
                {"title": "pushFormat", "description": "DESCRIPTION", "state": "PUBLISHED", "dueDate": {"year": 2023, "month": 12, "day": 31}, "dueTime": {"hours": 23, "minutes": 59, "seconds": 59, "nanos": 0}, "assigneeMode": "INDIVIDUAL_STUDENTS", "individualStudentsOptions": {"studentIds": "EMAIL"}, "submissionModificationMode": "MODIFIABLE", "workType": "ASSIGNMENT"},
                {"title": "pushFormat", "description": "DESCRIPTION", "state": "PUBLISHED", "dueDate": {"year": 2023, "month": 12, "day": 31}, "dueTime": {"hours": 23, "minutes": 59, "seconds": 59, "nanos": 0}, "assigneeMode": "INDIVIDUAL_STUDENTS", "individualStudentsOptions": {"studentIds": "EMAIL"}, "submissionModificationMode": "MODIFIABLE", "workType": "ASSIGNMENT"},
                {"title": "pushFormat", "description": "DESCRIPTION", "state": "PUBLISHED", "dueDate": {"year": 2023, "month": 12, "day": 31}, "dueTime": {"hours": 23, "minutes": 59, "seconds": 59, "nanos": 0}, "assigneeMode": "INDIVIDUAL_STUDENTS", "individualStudentsOptions": {"studentIds": "EMAIL"}, "submissionModificationMode": "MODIFIABLE", "workType": "ASSIGNMENT"}
            ]

            const pushTemplate = JSON.stringify(templates[0], null, 2);
            const editTemplate = JSON.stringify(templates[1], null, 2);
            const idkTemplate = JSON.stringify(templates[2], null, 2);

            console.log(pushTemplate)