const ThemedScrollbarStyles = ({
  isDarkMode,
  className = "theme-scrollbar",
  includePageScrollbar = false,
}) => {
  const trackColor = isDarkMode ? "rgba(32, 33, 35, 0.9)" : "rgba(15, 23, 42, 0.08)";
  const thumbColor = isDarkMode ? "rgba(217, 70, 239, 0.55)" : "rgba(76, 161, 175, 0.5)";
  const thumbHoverColor = isDarkMode ? "rgba(217, 70, 239, 0.75)" : "rgba(76, 161, 175, 0.75)";

  return (
    <style>{`
      .${className} {
        scrollbar-width: thin;
        scrollbar-color: ${thumbColor} ${trackColor};
      }

      .${className}::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      .${className}::-webkit-scrollbar-track {
        background: ${trackColor};
        border-radius: 9999px;
      }

      .${className}::-webkit-scrollbar-corner {
        background: ${trackColor};
      }

      .${className}::-webkit-scrollbar-thumb {
        background: ${thumbColor};
        border-radius: 9999px;
        border: 2px solid ${trackColor};
      }

      .${className}::-webkit-scrollbar-thumb:hover {
        background: ${thumbHoverColor};
      }

      ${includePageScrollbar ? `
      html, body {
        scrollbar-width: thin;
        scrollbar-color: ${thumbColor} ${trackColor};
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track {
        background: ${trackColor};
      }

      html::-webkit-scrollbar-corner,
      body::-webkit-scrollbar-corner {
        background: ${trackColor};
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb {
        background: ${thumbColor};
        border-radius: 9999px;
        border: 2px solid ${trackColor};
      }

      html::-webkit-scrollbar-thumb:hover,
      body::-webkit-scrollbar-thumb:hover {
        background: ${thumbHoverColor};
      }
      ` : ""}
    `}</style>
  );
};

export default ThemedScrollbarStyles;
