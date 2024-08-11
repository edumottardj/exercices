class Exercise {
    constructor(data) {
        this.id = data.id;
        this.title = data.title || "Exercice";
        this.statement = data.statement || "Compléter les blancs";
        this.textWithBlanks = data.textWithBlanks || "";
        this.notions = data.notions || [];
        this.authors = data.authors || [];
        this.answers = {};
    }

    createExerciseElement() {
        const exerciseContainer = document.createElement('div');
        exerciseContainer.className = 'exercise';

        const title = document.createElement('h2');
        title.textContent = this.title;
        exerciseContainer.appendChild(title);

        const statementElement = document.createElement('p');
        statementElement.innerHTML = this.statement.replace(/\n/g, "<br>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        exerciseContainer.appendChild(statementElement);

        const textContainer = document.createElement('div');
        textContainer.className = 'container notverified';
        exerciseContainer.appendChild(textContainer);

        const regex = /rep\{(.*?)\}/g;
        let parts = this.textWithBlanks.split(regex);

        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                let textPart = parts[i].replace(/\n/g, "<br>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                textContainer.insertAdjacentHTML('beforeend', textPart);
            } else {
                let input = document.createElement('input');
                input.type = 'text';
                input.className = 'input-field';
                input.id = `input-${this.title}-${i}`;
                input.style.width = `${parts[i].length}ch`;
                this.answers[`input-${this.title}-${i}`] = parts[i];
                textContainer.appendChild(input);
            }
        }

        const button = document.createElement('button');
        button.textContent = 'Vérifier';
        button.onclick = () => this.checkAnswers(textContainer);
        exerciseContainer.appendChild(button);

        const message = document.createElement('div');
        message.className = 'message';
        exerciseContainer.appendChild(message);

        const authorsElement = document.createElement('p');
        authorsElement.textContent = "Auteurs : " + (this.authors.length > 0 ? this.authors.join(', ') : "N/A");
        exerciseContainer.appendChild(authorsElement);

        return exerciseContainer;
    }

    checkAnswers(container) {
        let allCorrect = true;
        let someAlmostCorrect = false;
        let someCorrect = false;
        let noneCompleted = true;
        const inputs = container.querySelectorAll('.input-field');
        inputs.forEach(input => {
            const key = input.id;
            const userAnswer = input.value.trim();
            const correctAnswer = this.answers[key];
            if (userAnswer !== '') {
                noneCompleted = false;
            }
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                if (userAnswer === correctAnswer) {
                    input.style.borderColor = 'green';
                    someCorrect = true;
                } else {
                    input.style.borderColor = 'orange';
                    allCorrect = false;
                    someAlmostCorrect = true;
                }
            } else {
                input.style.borderColor = 'red';
                allCorrect = false;
            }
        });

        const message = container.parentNode.querySelector('.message');
        if (noneCompleted) {
            container.className = 'container notverified';
            message.textContent = 'Aucune réponse n\'a été complétée.';
        } else if (allCorrect) {
            container.classList.remove('notverified');
            container.classList.remove('incorrect');
            container.classList.remove('almost');
            container.classList.add('correct');
            message.textContent = 'Toutes les réponses sont correctes !';
        } else if (someAlmostCorrect || someCorrect) {
            container.classList.remove('notverified');
            container.classList.remove('incorrect');
            container.classList.remove('correct');
            container.classList.add('almost');
            message.textContent = 'Certaines réponses sont correctes ou presque correctes.';
        } else {
            container.classList.remove('notverified');
            container.classList.remove('correct');
            container.classList.remove('almost');
            container.classList.add('incorrect');
            message.textContent = 'Toutes les réponses sont incorrectes.';
        }
    }
}

async function loadExercisesFromURL(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.exercises.map(exerciseData => new Exercise(exerciseData));
    } catch (error) {
        console.error('Failed to load exercises:', error);
        return [];
    }
}

async function displayExerciseById(url, id) {
    const exercises = await loadExercisesFromURL(url);
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise) {
        const container = document.getElementById('exercise-container');
        container.appendChild(exercise.createExerciseElement());
    } else {
        console.error('Exercise not found');
    }
}

async function displayExercisesByNotion(url, notion) {
    const exercises = await loadExercisesFromURL(url);
    const container = document.getElementById('exercise-container');
    exercises.filter(ex => ex.notions.includes(notion))
             .forEach(ex => container.appendChild(ex.createExerciseElement()));
}

async function displayAllExercises(url) {
    const exercises = await loadExercisesFromURL(url);
    const container = document.getElementById('exercise-container');
    exercises.forEach(ex => container.appendChild(ex.createExerciseElement()));
}
