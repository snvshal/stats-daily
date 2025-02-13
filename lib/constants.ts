import { InitialState, TTask } from "./types";

// Export InitialState of Form Slice
export const initialState: InitialState = {
  area: "",
  note: "",
  task: "",
  tasks: [],
  etem: "",
};

export const tasksArray = [
  {
    userId: "",
    area: "Health",
    tasks: [
      {
        task: "Run 4km today",
        completed: false,
        achieved: 0,
      },
      {
        task: "Drink 4L water",
        completed: false,
        achieved: 0,
      },
      {
        task: "Meditate for 20 minutes",
        completed: false,
        achieved: 0,
      },
      {
        task: "Sleep for 8 hours",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Study",
    tasks: [
      {
        task: "Complete 2 chapters of mathematics",
        completed: false,
        achieved: 0,
      },
      {
        task: "Review lecture notes",
        completed: false,
        achieved: 0,
      },
      {
        task: "Practice coding for 1 hour",
        completed: false,
        achieved: 0,
      },
      {
        task: "Prepare for upcoming quiz",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Work",
    tasks: [
      {
        task: "Attend team meeting at 10 AM",
        completed: false,
        achieved: 0,
      },
      {
        task: "Respond to client emails",
        completed: false,
        achieved: 0,
      },
      {
        task: "Finish project report",
        completed: false,
        achieved: 0,
      },
      {
        task: "Review code for bug fixes",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Project",
    tasks: [
      {
        task: "Implement user authentication module",
        completed: false,
        achieved: 0,
      },
      {
        task: "Design landing page UI",
        completed: false,
        achieved: 0,
      },
      {
        task: "Test API endpoints",
        completed: false,
        achieved: 0,
      },
      {
        task: "Write documentation for the new feature",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Personal Development",
    tasks: [
      {
        task: "Read 20 pages of a book",
        completed: false,
        achieved: 0,
      },
      {
        task: "Watch a TED talk",
        completed: false,
        achieved: 0,
      },
      {
        task: "Write in a journal",
        completed: false,
        achieved: 0,
      },
      {
        task: "Practice a new language for 30 minutes",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Finance",
    tasks: [
      {
        task: "Review monthly budget",
        completed: false,
        achieved: 0,
      },
      {
        task: "Pay bills",
        completed: false,
        achieved: 0,
      },
      {
        task: "Check investment portfolio",
        completed: false,
        achieved: 0,
      },
      {
        task: "Plan next month's savings",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Relationships",
    tasks: [
      {
        task: "Call family members",
        completed: false,
        achieved: 0,
      },
      {
        task: "Have a lunch with a friend",
        completed: false,
        achieved: 0,
      },
      {
        task: "Write a thank-you note",
        completed: false,
        achieved: 0,
      },
      {
        task: "Spend quality time with a partner",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Household",
    tasks: [
      {
        task: "Clean the kitchen",
        completed: false,
        achieved: 0,
      },
      {
        task: "Do laundry",
        completed: false,
        achieved: 0,
      },
      {
        task: "Grocery shopping",
        completed: false,
        achieved: 0,
      },
      {
        task: "Organize workspace",
        completed: false,
        achieved: 0,
      },
    ],
  },
  {
    userId: "",
    area: "Hobbies",
    tasks: [
      {
        task: "Practice guitar for 1 hour",
        completed: false,
        achieved: 0,
      },
      {
        task: "Work on a painting",
        completed: false,
        achieved: 0,
      },
      {
        task: "Cook a new recipe",
        completed: false,
        achieved: 0,
      },
      {
        task: "Play chess online",
        completed: false,
        achieved: 0,
      },
    ],
  },
];

export const week = ["Mon", "Wed", "Fri"];
export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const areaNameLength = 40;
export const taskLength = 200;
export const areaNoteLength = 500;
