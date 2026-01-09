export const getBorderStyle = (level: number, role?: string) => {
  if (role === 'SUPERADMIN') {
    return {
      border: '4px solid transparent',
      background:
        'linear-gradient(#1a1b1e, #1a1b1e) padding-box, linear-gradient(135deg, #9333EA, #EC4899, #9333EA) border-box',
      boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
    };
  }
  if (role === 'ADMIN') {
    return {
      border: '4px solid transparent',
      background:
        'linear-gradient(#1a1b1e, #1a1b1e) padding-box, linear-gradient(135deg, #8B5CF6, #A78BFA, #8B5CF6) border-box',
      boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
    };
  }

  const levelStyles: Record<number, { colors: string; shadow: string }> = {
    1: { colors: 'linear-gradient(135deg, #CD853F, #DEB887, #CD853F)', shadow: '0 0 12px rgba(205, 133, 63, 0.4)' },
    2: { colors: 'linear-gradient(135deg, #A8A8A8, #E8E8E8, #A8A8A8)', shadow: '0 0 12px rgba(168, 168, 168, 0.4)' },
    3: { colors: 'linear-gradient(135deg, #FFD700, #FFF8DC, #FFD700)', shadow: '0 0 15px rgba(255, 215, 0, 0.5)' },
    4: { colors: 'linear-gradient(135deg, #E5E4E2, #FFFFFF, #E5E4E2)', shadow: '0 0 15px rgba(229, 228, 226, 0.5)' },
    5: { colors: 'linear-gradient(135deg, #50C878, #90EE90, #50C878)', shadow: '0 0 15px rgba(80, 200, 120, 0.5)' },
    6: { colors: 'linear-gradient(135deg, #0F52BA, #6495ED, #0F52BA)', shadow: '0 0 15px rgba(15, 82, 186, 0.5)' },
    7: { colors: 'linear-gradient(135deg, #E0115F, #FF69B4, #E0115F)', shadow: '0 0 15px rgba(224, 17, 95, 0.5)' },
    8: { colors: 'linear-gradient(135deg, #9966CC, #DDA0DD, #9966CC)', shadow: '0 0 15px rgba(153, 102, 204, 0.5)' },
    9: { colors: 'linear-gradient(135deg, #B9F2FF, #FFFFFF, #B9F2FF)', shadow: '0 0 20px rgba(185, 242, 255, 0.6)' },
    10: { colors: 'linear-gradient(135deg, #FFD700, #FF8C00, #FF4500, #FFD700)', shadow: '0 0 25px rgba(255, 140, 0, 0.6)' },
  };

  const style = levelStyles[level] || levelStyles[1];
  return {
    border: '4px solid transparent',
    background: `linear-gradient(#1a1b1e, #1a1b1e) padding-box, ${style.colors} border-box`,
    boxShadow: style.shadow,
  };
};

export const getBorderStyleLight = (level: number, role?: string) => {
  if (role === 'SUPERADMIN') {
    return {
      border: '4px solid transparent',
      background:
        'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #9333EA, #EC4899, #9333EA) border-box',
      boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)',
    };
  }
  if (role === 'ADMIN') {
    return {
      border: '4px solid transparent',
      background:
        'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #8B5CF6, #A78BFA, #8B5CF6) border-box',
      boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
    };
  }

  const levelStyles: Record<number, { colors: string; shadow: string }> = {
    1: { colors: 'linear-gradient(135deg, #B8860B, #CD853F, #B8860B)', shadow: '0 0 12px rgba(184, 134, 11, 0.3)' },
    2: { colors: 'linear-gradient(135deg, #808080, #C0C0C0, #808080)', shadow: '0 0 12px rgba(128, 128, 128, 0.3)' },
    3: { colors: 'linear-gradient(135deg, #DAA520, #FFD700, #DAA520)', shadow: '0 0 15px rgba(218, 165, 32, 0.4)' },
    4: { colors: 'linear-gradient(135deg, #A9A9A9, #E5E4E2, #A9A9A9)', shadow: '0 0 15px rgba(169, 169, 169, 0.4)' },
    5: { colors: 'linear-gradient(135deg, #228B22, #50C878, #228B22)', shadow: '0 0 15px rgba(34, 139, 34, 0.4)' },
    6: { colors: 'linear-gradient(135deg, #000080, #0F52BA, #000080)', shadow: '0 0 15px rgba(0, 0, 128, 0.4)' },
    7: { colors: 'linear-gradient(135deg, #8B0000, #E0115F, #8B0000)', shadow: '0 0 15px rgba(139, 0, 0, 0.4)' },
    8: { colors: 'linear-gradient(135deg, #4B0082, #9966CC, #4B0082)', shadow: '0 0 15px rgba(75, 0, 130, 0.4)' },
    9: { colors: 'linear-gradient(135deg, #00BFFF, #B9F2FF, #00BFFF)', shadow: '0 0 20px rgba(0, 191, 255, 0.4)' },
    10: { colors: 'linear-gradient(135deg, #FF8C00, #FFD700, #FF4500)', shadow: '0 0 25px rgba(255, 140, 0, 0.4)' },
  };

  const style = levelStyles[level] || levelStyles[1];
  return {
    border: '4px solid transparent',
    background: `linear-gradient(#ffffff, #ffffff) padding-box, ${style.colors} border-box`,
    boxShadow: style.shadow,
  };
};
