# manual_google_classroom_assignments

An app to allow a student to assign themselves their own Google Classroom assignments. 

Built using Flask, Electron app engine, Capacitor app engine, Bootstrap, and the Google Classroom REST API.  

<img width="1017" alt="Screenshot 2023-10-31 at 11 55 43 PM" src="https://github.com/CT-42210/manual_GC_assignments/assets/56010135/178e890f-7dcb-4e97-a9a0-34d43b20b07d">

From about.html:

# About
Manual GC Assignments is an app addressing Google Classroom's biggest weakness: Students cannot create assignments and reminders.

# Why can't students create their own assignments?
Google Classroom has two types of users: a teacher and a student. Teachers manage the classrooms and classwork, while students "edit" the classwork. In addition, students receive emails, notifications, and a compiled to-do list encompassing their assigned work. While a student account can be added as a teacher to a class, it does not allow them to receive the same benefits as students, such as email notifications and the GC to-do list. What's the solution? To automate the teacher.

# How does this app work?
This app synthesizes the user input into a JSON package. The app then sends the data to a server controlling the teacher's account. The teacher reads the data and forwards it to Google Classroom for the user to see.
