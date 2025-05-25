# Système de Déclaration de Naissance

Ce projet implémente un système de déclaration de naissance en ligne avec paiement électronique et génération de reçus.

## Fonctionnalités

- Formulaire de déclaration de naissance en plusieurs étapes
- Paiement en ligne via Orange Money, MTN Mobile Money, Moov Money et Wave
- Génération de reçus en PDF
- Envoi de reçus par email
- Suivi de l'état des demandes

## Configuration requise

1. Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com

# Configuration de la base de données
DATABASE_URL="postgresql://user:password@localhost:5432/birth_declaration_db"

# Configuration des services de paiement
ORANGE_MONEY_API_KEY=your-orange-money-api-key
MTN_MOBILE_MONEY_API_KEY=your-mtn-api-key
MOOV_MONEY_API_KEY=your-moov-api-key
WAVE_API_KEY=your-wave-api-key
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez votre base de données PostgreSQL et mettez à jour la variable `DATABASE_URL` dans le fichier `.env.local`.

4. Pour l'envoi d'emails avec Gmail :
   - Activez l'authentification à deux facteurs
   - Générez un mot de passe d'application
   - Utilisez ce mot de passe dans la variable `SMTP_PASSWORD`

5. Pour les services de paiement :
   - Créez des comptes développeur sur les plateformes de paiement
   - Obtenez les clés API nécessaires
   - Configurez les variables d'environnement correspondantes

## Démarrage

```bash
npm run dev
```

Le serveur de développement démarrera sur [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
├── app/
│   └── api/
│       └── birth-declaration/
│           ├── submit/
│           ├── payment/
│           ├── receipt/
│           └── send-receipt/
├── components/
│   └── services/
│       ├── BirthDeclaration.tsx
│       └── BirthDeclarationService.ts
└── public/
    └── uploads/
```

## API Endpoints

- `POST /api/birth-declaration/submit` : Soumettre une nouvelle déclaration
- `POST /api/birth-declaration/payment` : Traiter un paiement
- `GET /api/birth-declaration/receipt/:trackingNumber` : Télécharger un reçu
- `POST /api/birth-declaration/send-receipt` : Envoyer un reçu par email

## Sécurité

- Tous les fichiers uploadés sont stockés dans un dossier sécurisé
- Les paiements sont traités via des API sécurisées
- Les emails sont envoyés via une connexion SMTP sécurisée
- Les données sensibles sont stockées de manière sécurisée dans la base de données

## Support

Pour toute question ou problème, veuillez créer une issue sur le dépôt GitHub. 