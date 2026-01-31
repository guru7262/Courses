# EduLearn Admin Panel

Complete admin panel for managing courses, content types, topics, and content for the EduLearn platform.

## 🎯 Features

### ✅ Home Page
- Overview of all categories and courses
- Click any course to edit
- Clean, card-based layout matching your main app

### ✅ Manage Courses
- View all courses by category
- "Edit Course" button on each course card
- "Add New Course" button to create new courses

### ✅ Edit Course (Basic Info)
- Edit: Name, Category, Description, Icon, Color
- Upload banner image
- "Edit Content" button to manage actual course content
- Unsaved changes warning

### ✅ Edit Content (Full Content Editor)
- **Same layout as your content page** with 3 columns:
  - Left sidebar: Content types (Notes, Videos, etc.)
  - Middle: Content editor
  - Right sidebar: Topic tree
  
- **Manage Content Types:**
  - Add new content types (Notes, Videos, Mock Tests, etc.)
  - Delete content types
  - Each type has its own subtopic tree

- **Manage Topics:**
  - Add topics at any level
  - Add sub-subtopics (unlimited nesting)
  - Rename topics
  - Delete topics
  - Expandable/collapsible tree

- **Edit Content:**
  - Select any topic to edit its content
  - Text area for notes (plain text)
  - JSON editor for videos/links/mcqs
  - Real-time editing

### ✅ Add New Course
- Form to create a new course
- Automatically takes you to content editor after creation

### 📋 Manage Notifications (Placeholder)
- Reserved for future implementation

## 📦 Installation

### 1. Setup Admin Panel

```bash
cd admin-panel

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your API URL
# VITE_API_URL=http://localhost:5000/api
```

### 2. Update Backend Routes

Replace your backend `routes/categories.js` with the new `categories-admin-routes.js` file that includes PUT, POST, and DELETE operations.

```bash
# In your backend folder
cp categories-admin-routes.js routes/categories.js
```

### 3. Start the Admin Panel

```bash
npm run dev
```

Admin panel will run on: http://localhost:3001

## 🚀 Usage Guide

### Creating a New Course

1. Go to "Manage Courses"
2. Click "+ Add New Course"
3. Fill in:
   - Course ID (unique, lowercase with hyphens)
   - Name
   - Category (12th, 11th, etc.)
   - Description
   - Icon (emoji)
   - Color
   - Banner image (optional)
4. Click "Create Course"
5. You'll be redirected to content editor

### Editing Course Content

1. Select a course to edit
2. Click "Edit Content"
3. **Add Content Types:**
   - Click "+ Add Content Type" in left sidebar
   - Enter name (e.g., "Notes")
   - Enter type (notes/videos/links/mockTests/mcqs)
   - Enter icon (emoji)

4. **Add Topics:**
   - Click "+ Add Topic" in right sidebar
   - Enter topic name
   - Click "+ Sub" to add subtopics under any topic

5. **Edit Content:**
   - Click any topic in right sidebar
   - Edit content in the middle panel
   - For notes: Plain text
   - For videos/links: JSON array

6. **Save Changes:**
   - Click "Save Changes" button
   - Unsaved changes badge shows when there are changes

### Content Format Examples

**Notes (Plain Text):**
```
This is the content for this topic.

You can have multiple paragraphs.

Each paragraph will be displayed separately.
```

**Videos (JSON Array):**
```json
[
  {
    "title": "Introduction to Physics",
    "url": "https://youtube.com/watch?v=...",
    "thumbnail": "https://...",
    "duration": "15:30"
  }
]
```

**Links (JSON Array):**
```json
[
  {
    "title": "Physics Resources",
    "url": "https://example.com",
    "description": "Helpful resources for physics"
  }
]
```

**MCQs (JSON Array):**
```json
[
  {
    "question": "What is the SI unit of force?",
    "options": ["Newton", "Joule", "Watt", "Pascal"],
    "correctAnswer": 0
  }
]
```

**Mock Tests (JSON Array):**
```json
[
  {
    "title": "Physics Final Test",
    "duration": 60,
    "totalMarks": 100,
    "questions": []
  }
]
```

## 🎨 Design

The admin panel matches your main app's design:
- Same color scheme
- Same card layouts
- Same sidebar structure for content editor
- Clean, minimal design
- Responsive layout

## 🔧 API Endpoints Used

- `GET /api/categories` - List all categories and subjects
- `GET /api/categories/subject/:id` - Get single subject with content
- `PUT /api/categories/:categoryId/subject/:subjectId` - Update subject
- `POST /api/categories/:categoryId/subject` - Create new subject
- `DELETE /api/categories/:categoryId/subject/:subjectId` - Delete subject

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   └── Navbar.tsx           # Navigation bar
│   ├── pages/
│   │   ├── HomePage.tsx          # Overview of all courses
│   │   ├── ManageCoursesPage.tsx # Manage all courses
│   │   ├── EditCoursePage.tsx    # Edit basic course info
│   │   ├── EditContentPage.tsx   # Edit course content (main editor)
│   │   ├── AddCoursePage.tsx     # Create new course
│   │   └── ManageNotificationsPage.tsx # (Placeholder)
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   ├── styles/
│   │   └── App.css               # All styles
│   ├── App.tsx                   # Main app with routing
│   └── main.tsx                  # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ Features Breakdown

### Content Editor Layout (EditContentPage)

```
┌─────────────────────────────────────────────────────────┐
│                     Navbar                              │
├─────────────┬──────────────────────┬────────────────────┤
│   Content   │   Content Editor     │     Topics         │
│    Types    │                      │     Tree           │
│             │                      │                    │
│ 📝 Notes    │  [Edit Area]         │  • Mechanics       │
│ 🎥 Videos   │                      │    • Kinematics    │
│ 📋 Tests    │  Topic: Kinematics   │    • Dynamics      │
│             │                      │  • Thermodynamics  │
│ + Add Type  │  Content:            │                    │
│             │  [Text Area]         │  + Add Topic       │
│             │                      │                    │
│             │  [Save Button]       │                    │
└─────────────┴──────────────────────┴────────────────────┘
```

## 🔐 Security Notes

**This is an admin panel and should be:**
- Deployed separately from the main app
- Protected with authentication (to be added)
- Not publicly accessible
- Only accessible by admins

## 🐛 Troubleshooting

**Changes not saving:**
- Check backend console for errors
- Verify API URL in `.env` is correct
- Make sure MongoDB is running
- Check browser console (F12) for errors

**Cannot add courses:**
- Ensure course ID is unique
- Use lowercase letters and hyphens only
- All required fields must be filled

**Images not uploading:**
- Images are converted to base64
- Large images may take time to process
- Check browser console for errors

## 📝 TODO / Future Improvements

- [ ] Add authentication system
- [ ] Add user management
- [ ] Implement notifications management
- [ ] Add course duplication feature
- [ ] Add bulk import/export
- [ ] Add preview mode
- [ ] Add version history
- [ ] Add rich text editor for notes
- [ ] Add drag-and-drop for topic reordering

## 🎉 You're All Set!

Your admin panel is now ready to use. You can:
- ✅ View all courses
- ✅ Edit existing courses
- ✅ Add new courses
- ✅ Manage content types
- ✅ Create nested topic structures
- ✅ Edit all content

Start by going to http://localhost:3001 and managing your courses!
