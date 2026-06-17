# gone.
*the to-do list that forgets on purpose.*

**gone.** is a brutalist, ephemeral task manager that fundamentally challenges how you interact with your to-do list. Instead of hoarding tasks that you will never actually do, **gone.** enforces action through immediate decay. 

Every task you create begins dying the moment you hit enter.

## Features

* **Ephemeral Tasks:** Tasks are not permanent. You set their lifespan based on your conviction.
* **Conviction-Based Lifespans:** The time you spend typing and staring at the input box directly translates to the task's lifespan. If you type quickly, the task expires quickly (e.g., 1 day). If you stare at the screen for a minute agonizing over the wording, the task will last longer. The app judges your hesitation.
* **The Graveyard:** When a task expires before you complete it, it is not simply deleted. It is moved to the Graveyard, forever memorializing your failure to commit.
* **Hostile UX:** The app will mock you. It will judge your long tasks ("you are writing an essay not a task"), it will judge your hesitation, and it will aggressively remind you that your tasks are bleeding time.
* **The Permanent Task:** There is only one task that never expires, and it trusts you to keep the habit alive.
* **Neo-Brutalist Aesthetic:** Built with a warm paper-texture background, harsh dark ink borders, and sharp, boxy shadows. 
* **Progress Web App (PWA):** Fully installable as a standalone app on your mobile device or desktop.

## Philosophy

Most to-do lists are guilt-trip machines. You add 50 things, you do 3, and the remaining 47 stare at you for the rest of the year. **gone.** solves this by giving every task an expiration date. If you don't do it before the timer runs out, the task dies. If it was truly important, you would have done it. If it wasn't, you shouldn't have written it down.

## Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS + Vanilla CSS Variables
* **Animations:** Framer Motion
* **Deployment:** Vercel

## Demo Mode

To properly evaluate or showcase the app without waiting days for tasks to expire, **gone.** includes a hidden developer Demo Mode.

### How to enable Demo Mode:
1. Open your browser's Developer Console (F12 or Cmd+Option+J).
2. Type the following command and hit Enter:
   ```javascript
   demoMode.enable()
   ```
3. A floating Demo Tool panel will instantly appear on your screen.

### Using the Demo Tool:
The Demo Tool provides a direct interface to manipulate time for your active tasks, allowing you to instantly visualize the decay mechanics:
* **`+1H`**: Fast-forwards the selected task by 1 hour. You will see the progress bar instantly shrink.
* **`+24H`**: Fast-forwards the selected task by a full 24 hours.
* **`End`**: Instantly kills the task, moving it directly to the Graveyard below.

To turn off Demo Mode, simply click the red `X` on the Demo Tool panel, or type `demoMode.disable()` in the console.

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
