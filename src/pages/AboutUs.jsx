import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';

const texts = [
  {
    text: 'Affordable cameras. Unaffordable Instagram clout.',
    style: { top: '8%', left: '7%', textAlign: 'left' },
  },
  {
    text: 'Because buying a pro camera shouldn’t mean eating instant noodles for a year.',
    style: { top: '28%', right: '8%', textAlign: 'right' },
  },
  {
    text: 'Turning “I wish I could afford that” into “Wait, it’s HOW cheap?!”',
    style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
  },
  {
    text: 'No fine print. No drama. Just gear and good vibes.',
    style: { bottom: '22%', left: '10%', textAlign: 'left' },
  },
  {
    text: 'Weddings, influencers, dads, and even cats (if they sign the waiver).',
    style: { bottom: '8%', right: '7%', textAlign: 'right' },
  },
];

const team = [
  {
    name: 'Jithesh',
    title: 'The Aura Chaser',
    desc: 'Can spot the perfect light even in a blackout.',
  },
  {
    name: 'Deekshith',
    title: 'The Pixel Whisperer',
    desc: 'Talks to cameras. They listen.',
  },
  {
    name: 'Greeshma',
    title: 'The Silent Killer',
    desc: 'You won’t hear her click, but you’ll see the magic.',
  },
  {
    name: 'Chaithra',
    title: 'The Lens Queen',
    desc: 'Rules the frame, one shot at a time.',
  },
  {
    name: 'Ashitha',
    title: 'The Focus Guru',
    desc: 'Brings everything (and everyone) into focus.',
  },
  {
    name: 'Yashaswi',
    title: 'The Shutterbug Supreme',
    desc: 'Clicks faster than you can say “cheese”.',
  },
];

const AboutUs = () => {
  const [visible, setVisible] = useState([false, false, false, false, false]);
  const [teamVisible, setTeamVisible] = useState(Array(team.length).fill(false));
  const teamRefs = useRef([]);

  useEffect(() => {
    // Animate in each text block one by one
    texts.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 1400 * i + 600);
    });
  }, []);

  useEffect(() => {
    // Intersection Observer for team blocks
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'));
            setTeamVisible((prev) => {
              if (prev[idx]) return prev;
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    teamRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        backgroundImage: 'url(/us.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 0,
        m: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
      }}
    >
      {/* Overlay for readability, very transparent */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(255,255,255,0.10)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Animated, bold, scattered text blocks */}
      {texts.map((item, i) => (
        <Typography
          key={i}
          variant="h4"
          component="div"
          sx={{
            position: 'absolute',
            maxWidth: { xs: '90vw', md: 420 },
            fontWeight: 900,
            color: '#222',
            textShadow: '0 2px 16px #fff, 0 1px 8px #0008',
            letterSpacing: 0.5,
            fontSize: { xs: 20, sm: 26, md: 32 },
            opacity: visible[i] ? 1 : 0,
            transform: visible[i]
              ? (item.style.transform || 'none')
              : `translateY(40px) scale(0.98)`,
            transition:
              'opacity 1s cubic-bezier(.4,2,.6,1), transform 1s cubic-bezier(.4,2,.6,1)',
            zIndex: 2,
            p: 2,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.32)',
            boxShadow: '0 4px 24px 0 rgba(51,51,51,0.10)',
            ...item.style,
          }}
        >
          {item.text}
        </Typography>
      ))}
      {/* Team Section */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          mt: { xs: '60vh', md: '70vh' },
          mb: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 4, md: 6 },
        }}
      >
        <Typography
          variant="h3"
          fontWeight={900}
          color="primary.main"
          sx={{ mb: 2, textShadow: '0 2px 16px #fff, 0 1px 8px #0008' }}
        >
          Meet the Team
        </Typography>
        {team.map((member, idx) => (
          <Box
            key={member.name}
            ref={el => (teamRefs.current[idx] = el)}
            data-idx={idx}
            sx={{
              opacity: teamVisible[idx] ? 1 : 0,
              transform: teamVisible[idx]
                ? 'none'
                : 'translateY(60px) scale(0.96)',
              transition:
                'opacity 1.2s cubic-bezier(.4,2,.6,1), transform 1.2s cubic-bezier(.4,2,.6,1)',
              background: 'rgba(255,255,255,0.38)',
              boxShadow: '0 4px 24px 0 rgba(51,51,51,0.10)',
              borderRadius: 4,
              px: { xs: 3, md: 6 },
              py: { xs: 2, md: 3 },
              minWidth: 260,
              maxWidth: 480,
              textAlign: 'center',
              fontWeight: 900,
              color: '#222',
              textShadow: '0 2px 16px #fff, 0 1px 8px #0008',
              fontSize: { xs: 18, md: 24 },
              mb: 1,
            }}
          >
            <Typography variant="h5" fontWeight={900} color="primary" sx={{ mb: 1 }}>
              {member.name} <span style={{ fontWeight: 700, fontSize: 18 }}>({member.title})</span>
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {member.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AboutUs; 