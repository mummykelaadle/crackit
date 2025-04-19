import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Code, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoMarquee } from './LogoMarquee ';


const Home = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleCardClick = (route) => {
    navigate(route);
  };

  const cards = [
    {
      id: 'resume',
      title: 'Resume Round',
      description:
        "Craft the perfect first impression. Learn how to build a standout resume that catches recruiters' attention.",
      icon: <FileText className="h-6 w-6" />,
      route: '/resume',
    },
    {
      id: 'coding',
      title: 'Coding Round',
      description:
        'Sharpen your problem-solving skills. Practice data structures, algorithms, and system design to crack the technical rounds.',
      icon: <Code className="h-6 w-6" />,
      route: '/coding',
    },
    {
      id: 'behavioral',
      title: 'Behavioral Round',
      description:
        'Prepare for conversations that count. Master communication, teamwork, and culture-fit questions with ease.',
      icon: <Users className="h-6 w-6" />,
      route: '/behavioral',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            CrackIt
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ace Your Next Interview – Step by Step
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Master every stage of the interview process with our comprehensive guides and resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`bg-zinc-900 border-zinc-800 transition-all duration-300 cursor-pointer overflow-hidden ${
                hoveredCard === card.id
                  ? 'shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-[1.02] border-cyan-500/50'
                  : ''
              }`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(card.route)}
            >
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400">
                  {card.icon}
                </div>
                <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400 text-sm">
                  {card.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 p-0 flex items-center gap-1"
                >
                  Learn more <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-24">
          <LogoMarquee />
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} CrackIt. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
