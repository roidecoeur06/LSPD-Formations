// MOT DE PASSE FORMATEUR / INSTRUCTEUR
const TRAINER_PASSWORD = "Viceland2026"; 

// INITIALISATION DU ROSTER TOTALEMENT VIERGE
const defaultRookies = [];

if (!localStorage.getItem('lspd_rosters')) {
    localStorage.setItem('lspd_rosters', JSON.stringify(defaultRookies));
}

function getRosters() {
    return JSON.parse(localStorage.getItem('lspd_rosters')) || [];
}

function saveRosters(data) {
    localStorage.setItem('lspd_rosters', JSON.stringify(data));
}

// CONTENU DES MODULES DU MANUEL ROOKIE
const modulesData = {
    ls1: `<h1>Formation Initiale LSPD</h1><h2>1. Équipements</h2><p>Glock 17, Taser X26, Flashball, Radio, Jumelles.</p><h2>2. Unités</h2><p><strong>MCD (Detective Bureau) :</strong> Enquêtes & Investigations.<br><strong>S.W.A.T :</strong> Interventions à haut risque.</p>`,
    ls2: `<h1>Procédures Pénales</h1><p>Les 7 étapes : Interpellation, Arrestation, Droits Miranda, Fouille, Identification, GAV, Rapport.</p>`,
    ls3: `<h1>Formation Patrouille</h1><p>Lincoln, Adam, Tango, Xray. Contrôle routier & Réponse obligatoire aux appels 911.</p>`,
    ls4: `<h1>Codes Radio & 10-XX</h1><p>10-4 (Reçu), 10-20 (Position), 10-35 (Renforts), 10-56 (Refus d'obtempérer), 10-99 (Agent en danger).</p>`,
    ls5: `<h1>Formation Opération</h1><p>Périmètres de sécurité (Zone Grise & Zone Rouge), règles d'engagement.</p>`,
    ls6: `<h1>Formation Conduite</h1><p>Conduite prioritaire sous Code 3 et manœuvres PIT de neutralisation.</p>`
};

// NAVIGATION DU MANUEL
const homeView = document.getElementById('home-view');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detail-content');
const backBtn = document.getElementById('back-btn');

document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        const moduleKey = card.getAttribute('data-module');
        if (modulesData[moduleKey]) {
            detailContent.innerHTML = modulesData[moduleKey];
            homeView.classList.add('hidden');
            detailView.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

backBtn.addEventListener('click', () => {
    detailView.classList.add('hidden');
    homeView.classList.remove('hidden');
});

// MODAL DE CONNEXION & GESTION DU MOT DE PASSE
const loginModal = document.getElementById('login-modal');
const btnLoginModal = document.getElementById('btn-login-modal');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('login-form');
const navUserZone = document.getElementById('nav-user-zone');
const roleSelect = document.getElementById('role-select');
const passwordGroup = document.getElementById('password-group');
const passwordInput = document.getElementById('password-input');

const rookieDashboard = document.getElementById('rookie-dashboard');
const trainerDashboard = document.getElementById('trainer-dashboard');

let currentUser = null;

roleSelect.addEventListener('change', () => {
    if (roleSelect.value === 'trainer') {
        passwordGroup.classList.remove('hidden');
        passwordInput.setAttribute('required', 'true');
    } else {
        passwordGroup.classList.add('hidden');
        passwordInput.removeAttribute('required');
        passwordInput.value = '';
    }
});

btnLoginModal.onclick = () => loginModal.classList.remove('hidden');
closeModal.onclick = () => loginModal.classList.add('hidden');

loginForm.onsubmit = (e) => {
    e.preventDefault();
    const matricule = document.getElementById('matricule-input').value.trim();
    const role = roleSelect.value;

    if (role === 'trainer') {
        const pass = passwordInput.value.trim();
        if (pass !== TRAINER_PASSWORD) {
            alert("❌ Mot de passe instructeur incorrect ! Accès refusé.");
            return;
        }
    }

    currentUser = { matricule, role };
    loginModal.classList.add('hidden');
    passwordInput.value = '';
    updateNavUser();
    renderUserView();
};

function updateNavUser() {
    if (currentUser) {
        navUserZone.innerHTML = `
            <span style="margin-right:15px; font-weight:600; color: var(--lspd-blue)">Agent #${currentUser.matricule} (${currentUser.role === 'trainer' ? 'Instructeur' : 'Rookie'})</span>
            <button id="btn-logout" class="btn btn-secondary btn-small">Déconnexion</button>
        `;
        document.getElementById('btn-logout').onclick = logout;
    }
}

function logout() {
    currentUser = null;
    navUserZone.innerHTML = `<button id="btn-login-modal" class="btn btn-small">🔒 Connexion Agent</button>`;
    document.getElementById('btn-login-modal').onclick = () => loginModal.classList.remove('hidden');
    
    rookieDashboard.classList.add('hidden');
    trainerDashboard.classList.add('hidden');
    homeView.classList.remove('hidden');
}

// RENDU DES VUES
function renderUserView() {
    homeView.classList.add('hidden');
    detailView.classList.add('hidden');

    if (currentUser.role === 'rookie') {
        rookieDashboard.classList.remove('hidden');
        trainerDashboard.classList.add('hidden');
        renderRookieView();
    } else if (currentUser.role === 'trainer') {
        trainerDashboard.classList.remove('hidden');
        rookieDashboard.classList.add('hidden');
        renderTrainerTable();
    }
}

// VUE RECRUE / ROOKIE
function renderRookieView() {
    const rosters = getRosters();
    let rookie = rosters.find(r => r.matricule === currentUser.matricule);

    if (!rookie) {
        rookie = { 
            matricule: currentUser.matricule, 
            name: "Recrue #" + currentUser.matricule, 
            modules: { ls1: false, ls2: false, ls3: false, ls4: false, ls5: false, ls6: false } 
        };
        rosters.push(rookie);
        saveRosters(rosters);
    }

    document.getElementById('rookie-matricule-display').innerText = `#${rookie.matricule}`;
    const statusGrid = document.getElementById('rookie-status-grid');
    statusGrid.innerHTML = '';

    for (let i = 1; i <= 6; i++) {
        const modKey = `ls${i}`;
        const isValid = rookie.modules[modKey];

        statusGrid.innerHTML += `
            <div class="status-card">
                <div>
                    <strong>Module LS ${i}</strong>
                </div>
                <span class="status-badge ${isValid ? 'valid' : 'pending'}">
                    ${isValid ? '✅ Validé' : '⏳ En attente'}
                </span>
            </div>
        `;
    }
}

// VUE FORMATEUR (TABLEAU CLEAN SANS TEXTE DE BASE)
function renderTrainerTable() {
    const rosters = getRosters();
    const tbody = document.getElementById('roster-tbody');
    tbody.innerHTML = '';

    // Si aucune recrue n'est enregistrée, le tableau reste totalement vide
    if (rosters.length === 0) {
        return;
    }

    rosters.forEach((rookie, index) => {
        let validCount = Object.values(rookie.modules).filter(v => v).length;
        
        let row = `<tr>
            <td><strong>#${rookie.matricule}</strong></td>
            <td>${rookie.name}</td>`;

        for (let i = 1; i <= 6; i++) {
            const modKey = `ls${i}`;
            const checked = rookie.modules[modKey];
            row += `<td class="module-check" onclick="toggleModule(${index}, '${modKey}')">${checked ? '✅' : '❌'}</td>`;
        }

        row += `<td><span class="status-badge ${validCount === 6 ? 'valid' : 'pending'}">${validCount}/6 Validés</span></td>
                <td><button class="btn-danger" onclick="deleteRookie(${index})">🗑️ Supprimer</button></td>
               </tr>`;
        tbody.innerHTML += row;
    });
}

// BASCULER LA VALIDATION D'UN MODULE
window.toggleModule = function(rookieIndex, moduleKey) {
    const rosters = getRosters();
    rosters[rookieIndex].modules[moduleKey] = !rosters[rookieIndex].modules[moduleKey];
    saveRosters(rosters);
    renderTrainerTable();
};

// SUPPRESSION D'UNE FICHE RECRUE
window.deleteRookie = function(rookieIndex) {
    const rosters = getRosters();
    const targetRookie = rosters[rookieIndex];

    if (confirm(`Voulez-vous vraiment supprimer la fiche de la recrue #${targetRookie.matricule} (${targetRookie.name}) ?`)) {
        rosters.splice(rookieIndex, 1);
        saveRosters(rosters);
        renderTrainerTable();
    }
};

// RECHERCHE DANS LE TABLEAU
document.getElementById('search-rookie').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#roster-tbody tr');
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

// BOUTON AJOUTER UNE RECRUE
document.getElementById('add-rookie-btn').onclick = () => {
    const mat = prompt("Entrez le matricule de la nouvelle recrue :");
    if (!mat) return;
    const name = prompt("Entrez le Nom / Prénom de la recrue :");
    if (!name) return;

    const rosters = getRosters();
    if (rosters.some(r => r.matricule === mat)) {
        alert("Ce matricule existe déjà dans le tableau.");
        return;
    }

    rosters.push({
        matricule: mat,
        name: name,
        modules: { ls1: false, ls2: false, ls3: false, ls4: false, ls5: false, ls6: false }
    });
    saveRosters(rosters);
    renderTrainerTable();
};