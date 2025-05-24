import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, FileText, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainNav } from '@/components/main-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DocService</span>
          </div>
          
          <MainNav />
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:flex gap-2">
              <Link href="/auth/login">
                <Button variant="outline">Connexion</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Inscription</Button>
              </Link>
              <Link href="/auth/admin-login">
                <Button variant="ghost" className="text-primary">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
            <div className="md:hidden">
              <Link href="/auth/login">
                <Button>Connexion</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-br from-brand-orange-50 via-white to-brand-green-50">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 animate-fadeIn">
            <div className="space-y-4 max-w-[800px]">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Vos documents administratifs en quelques clics
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px] mx-auto">
                Simplifiez vos démarches administratives. Demandez, suivez et recevez vos documents officiels sans vous déplacer.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto animate-slideUp">
                  Commencer maintenant
                </Button>
              </Link>
              <Link href="#services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto animate-slideUp" style={{ animationDelay: '150ms' }}>
                  Découvrir nos services
                </Button>
              </Link>
            </div>
            <div className="w-full max-w-5xl mt-12 rounded-lg overflow-hidden shadow-2xl border animate-slideUp" style={{ animationDelay: '300ms' }}>
              <Image 
                src="https://images.pexels.com/photos/8867432/pexels-photo-8867432.jpeg" 
                alt="Plateforme de documents administratifs" 
                width={1920} 
                height={1080} 
                priority
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section id="services" className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">Nos Services</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Accédez à une variété de documents officiels depuis le confort de votre domicile.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Actes de Naissance",
                  description: "Demandez des copies ou extraits d'actes de naissance en quelques étapes simples.",
                  icon: "https://images.pexels.com/photos/568027/pexels-photo-568027.jpeg"
                },
                {
                  title: "Certificats de Mariage",
                  description: "Obtenez des certificats de mariage pour vos démarches administratives.",
                  icon: "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg"
                },
                {
                  title: "Documents d'Identité",
                  description: "Lancez vos demandes de documents d'identité officiels facilement.",
                  icon: "https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg"
                },
                {
                  title: "Certificats de Résidence",
                  description: "Demandez des attestations de résidence pour vos différentes procédures.",
                  icon: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg"
                },
                {
                  title: "Livrets de Famille",
                  description: "Obtenez ou mettez à jour votre livret de famille en ligne.",
                  icon: "https://images.pexels.com/photos/5257481/pexels-photo-5257481.jpeg"
                },
                {
                  title: "Autres Documents",
                  description: "Consultez notre catalogue complet pour tous vos besoins administratifs.",
                  icon: "https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg"
                },
              ].map((service, i) => (
                <div key={i} className="rounded-lg border bg-card shadow-sm overflow-hidden card-hover animation-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-40 overflow-hidden">
                    <Image 
                      src={service.icon}
                      alt={service.title}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <Link href="/auth/register">
                      <Button variant="outline" className="w-full">
                        Faire une demande <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">Comment Ça Marche</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Un processus simple en quatre étapes pour obtenir vos documents.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Créez un compte",
                  description: "Inscrivez-vous sur notre plateforme pour accéder à tous nos services."
                },
                {
                  title: "Faites votre demande",
                  description: "Sélectionnez le document souhaité et remplissez le formulaire approprié."
                },
                {
                  title: "Suivez votre demande",
                  description: "Surveillez l'état de votre demande dans votre espace personnel."
                },
                {
                  title: "Recevez votre document",
                  description: "Téléchargez votre document ou recevez-le selon le mode choisi."
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3 animation-slideUp" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* User Types */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">Choisissez Votre Profil</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Notre plateforme s'adapte à vos besoins spécifiques.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Citoyen",
                  description: "Accédez à tous vos documents administratifs et suivez vos demandes en temps réel.",
                  icon: User,
                  link: "/citizen/dashboard"
                },
                {
                  title: "Agent Administratif",
                  description: "Gérez les demandes de documents et interagissez avec les citoyens.",
                  icon: FileText,
                  link: "/auth/agent-login"
                },
                {
                  title: "Administrateur",
                  description: "Supervisez l'ensemble du système et gérez les utilisateurs et les configurations.",
                  icon: ShieldCheck,
                  link: "/auth/admin-login"
                }
              ].map((profile, i) => (
                <div key={i} className="flex flex-col items-center text-center p-8 rounded-lg border bg-card shadow-sm space-y-4 card-hover animation-fadeIn" style={{ animationDelay: `${i * 150}ms` }}>
                  <profile.icon className="h-16 w-16 text-primary" />
                  <h3 className="text-xl font-semibold">{profile.title}</h3>
                  <p className="text-muted-foreground">{profile.description}</p>
                  <Link href={profile.link} className="mt-4">
                    <Button variant="outline">
                      Accès {profile.title} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-16 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">Questions Fréquentes</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Trouvez des réponses aux questions les plus courantes.
              </p>
            </div>
            
            <div className="grid gap-6 max-w-3xl mx-auto">
              {[
                {
                  question: "Combien de temps faut-il pour traiter ma demande ?",
                  answer: "Le délai de traitement dépend du type de document demandé, mais la plupart des demandes sont traitées dans un délai de 2 à 5 jours ouvrables."
                },
                {
                  question: "Comment puis-je payer pour mes documents ?",
                  answer: "Nous acceptons les paiements par mobile money et carte bancaire. Tous les paiements sont sécurisés et vous recevrez une confirmation immédiate."
                },
                {
                  question: "Puis-je suivre l'état de ma demande ?",
                  answer: "Oui, vous pouvez suivre l'état de votre demande en temps réel depuis votre espace personnel sur notre plateforme."
                },
                {
                  question: "Les documents fournis sont-ils officiels ?",
                  answer: "Oui, tous les documents fournis sont officiels et légalement reconnus par les autorités compétentes."
                },
                {
                  question: "Comment puis-je contacter le service client ?",
                  answer: "Notre service client est disponible par email, téléphone ou chat en ligne du lundi au vendredi de 8h à 18h."
                }
              ].map((faq, i) => (
                <div key={i} className="rounded-lg border bg-card p-6 shadow-sm animation-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">DocService</span>
              </div>
              <p className="text-muted-foreground">
                Simplifiez vos démarches administratives avec notre plateforme intuitive.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link></li>
                <li><Link href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
                <li><Link href="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">Connexion</Link></li>
                <li><Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">Inscription</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Ressources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Centre d'aide</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Guides utilisateur</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Tutoriels</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <address className="not-italic text-muted-foreground space-y-2">
                <p>Email: contact@docservice.com</p>
                <p>Téléphone: +123 456 789</p>
                <p>Adresse: 123 Avenue Principale, Ville</p>
              </address>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 DocService. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Mentions légales</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}