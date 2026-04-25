import { Container, Text } from '@mantine/core';
import { useEffect, useState, useCallback } from 'react';
import { MatchCardInterface } from '../model/Interfaces';
import MatchCard from '../components/MatchCards';
import { API_URL, JWT_STORAGE } from '../model/Constants';
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
import { useViewportSize } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const MatchHistoryPage = () => {

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchCardInterface[]>([]);
  const { width } = useViewportSize();
  const { t } = useTranslation();
  const location = useLocation();


  const getColumnCount = () => {
    if (width < 576) return 1;      // Mobile
    if (width < 768) return 2;      // Tablet small
    if (width < 992) return 2;      // Tablet large
    if (width < 1200) return 2;     // IPad portrait 
    if (width < 1400) return 3;     // Desktop medium / IPad landscape
    return 4;                       // Desktop large
  };

  const loadMatchHistory = useCallback(async () => {
    setLoading(true);
    try {

      const requestOptions: RequestInit = {
        method: "GET",
      };

      if (JWT_STORAGE === "cookie") {
        requestOptions.credentials = "include";
      } else if (JWT_STORAGE === "localstorage") {
        requestOptions.headers = {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        };
      }

      const response = await fetch(`${API_URL}/matchHistory`, requestOptions);
      const data: MatchCardInterface[] = await response.json();
      setMatches(data);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    loadMatchHistory();
  }, [location.key, loadMatchHistory]);

  return (
    <Container size="xl" px="xs">
      <Text size="xl" mb="md">{t("MatchHistoryTitle", { defaultValue: "Match History" })}</Text>
      {loading ? (
        <Text>{t("MatchHistoryLoadingMessage", { defaultValue: "Loading..." })}</Text>
      ) : error ? (
        <Text c="red">{error}</Text>
      ) : (

        <MasonryInfiniteGrid
          gap={16}
          column={getColumnCount()}
          align="center"
          itemGroup={false}
        //style={{ width: "100%" }}
        >
          {matches.map((match, index) => (
            <div key={index} className='!p-2'>
              <MatchCard
                game_name={match.game_name}
                date={match.date}
                game_duration={match.game_duration}
                winner={match.winner}
                game_image={match.game_image}
                players={match.players}
                notes={match.notes}
                image_url={match.image_url}
                is_cooperative={match.is_cooperative}
                is_team_match={match.is_team_match}
                winning_team={match.winning_team}
                use_manual_winner={match.use_manual_winner}
              />
            </div>
          ))}
        </MasonryInfiniteGrid>


      )}
    </Container>
  );
};

export default MatchHistoryPage;

