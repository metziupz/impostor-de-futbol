const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- LISTA DE PERSONAJES COMPLETA Y ACTUALIZADA ---
const characterData = [
    // Originales
    { name: 'Lionel Messi', club: 'FC Barcelona', team: 'Argentina', position: 'Delantero' },
    { name: 'Cristiano Ronaldo', club: 'Real Madrid', team: 'Portugal', position: 'Delantero' },
    { name: 'Neymar', club: 'FC Barcelona', team: 'Brasil', position: 'Extremo' },
    { name: 'Kylian Mbappé', club: 'Paris Saint-Germain', team: 'Francia', position: 'Delantero' },
    { name: 'Karim Benzema', club: 'Real Madrid', team: 'Francia', position: 'Delantero centro' },
    { name: 'Robert Lewandowski', club: 'Bayern Múnich', team: 'Polonia', position: 'Delantero centro' },
    { name: 'Luka Modrić', club: 'Real Madrid', team: 'Croacia', position: 'Mediocentro' },
    { name: 'Kevin De Bruyne', club: 'Manchester City', team: 'Bélgica', position: 'Mediocentro ofensivo' },
    { name: 'Erling Haaland', club: 'Manchester City', team: 'Noruega', position: 'Delantero centro' },
    { name: 'Vinícius Júnior', club: 'Real Madrid', team: 'Brasil', position: 'Extremo' },
    { name: 'Mohamed Salah', club: 'Liverpool', team: 'Egipto', position: 'Extremo' },
    { name: 'Sadio Mané', club: 'Liverpool', team: 'Senegal', position: 'Extremo' },
    { name: 'Bruno Fernandes', club: 'Manchester United', team: 'Portugal', position: 'Mediocentro ofensivo' },
    { name: 'Bernardo Silva', club: 'Manchester City', team: 'Portugal', position: 'Interior / Extremo' },
    { name: 'Phil Foden', club: 'Manchester City', team: 'Inglaterra', position: 'Mediocentro ofensivo' },
    { name: 'Pedri', club: 'FC Barcelona', team: 'España', position: 'Mediocentro' },
    { name: 'Gavi', club: 'FC Barcelona', team: 'España', position: 'Mediocentro' },
    { name: 'Frenkie de Jong', club: 'Ajax', team: 'Países Bajos', position: 'Mediocentro' },
    { name: 'Antoine Griezmann', club: 'Atlético de Madrid', team: 'Francia', position: 'Delantero' },
    { name: 'João Félix', club: 'Atlético de Madrid', team: 'Portugal', position: 'Mediapunta' },
    { name: 'David de Gea', club: 'Manchester United', team: 'España', position: 'Portero' },
    { name: 'Thibaut Courtois', club: 'Real Madrid', team: 'Bélgica', position: 'Portero' },
    { name: 'Marc-André ter Stegen', club: 'FC Barcelona', team: 'Alemania', position: 'Portero' },
    { name: 'Ederson', club: 'Manchester City', team: 'Brasil', position: 'Portero' },
    { name: 'Alisson Becker', club: 'Liverpool', team: 'Brasil', position: 'Portero' },
    { name: 'Manuel Neuer', club: 'Bayern Múnich', team: 'Alemania', position: 'Portero' },
    { name: 'Gianluigi Donnarumma', club: 'AC Milan', team: 'Italia', position: 'Portero' },
    { name: 'Gianluigi Buffon', club: 'Juventus', team: 'Italia', position: 'Portero' },
    { name: 'Iker Casillas', club: 'Real Madrid', team: 'España', position: 'Portero' },
    { name: 'Sergio Ramos', club: 'Real Madrid', team: 'España', position: 'Defensa central' },
    { name: 'Gerard Piqué', club: 'FC Barcelona', team: 'España', position: 'Defensa central' },
    { name: 'Carles Puyol', club: 'FC Barcelona', team: 'España', position: 'Defensa central' },
    { name: 'Jordi Alba', club: 'FC Barcelona', team: 'España', position: 'Lateral izquierdo' },
    { name: 'Dani Alves', club: 'FC Barcelona', team: 'Brasil', position: 'Lateral derecho' },
    { name: 'Marcelo', club: 'Real Madrid', team: 'Brasil', position: 'Lateral izquierdo' },
    { name: 'Roberto Carlos', club: 'Real Madrid', team: 'Brasil', position: 'Lateral izquierdo' },
    { name: 'Cafu', club: 'AC Milan', team: 'Brasil', position: 'Lateral derecho' },
    { name: 'Paolo Maldini', club: 'AC Milan', team: 'Italia', position: 'Defensa / Lateral' },
    { name: 'Alessandro Nesta', club: 'AC Milan', team: 'Italia', position: 'Defensa central' },
    { name: 'Giorgio Chiellini', club: 'Juventus', team: 'Italia', position: 'Defensa central' },
    { name: 'Virgil van Dijk', club: 'Liverpool', team: 'Países Bajos', position: 'Defensa central' },
    { name: 'Raphaël Varane', club: 'Real Madrid', team: 'Francia', position: 'Defensa central' },
    { name: 'Pepe', club: 'Real Madrid', team: 'Portugal', position: 'Defensa central' },
    { name: 'Diego Godín', club: 'Atlético de Madrid', team: 'Uruguay', position: 'Defensa central' },
    { name: 'Marquinhos', club: 'Paris Saint-Germain', team: 'Brasil', position: 'Defensa central' },
    { name: 'Thiago Silva', club: 'Paris Saint-Germain', team: 'Brasil', position: 'Defensa central' },
    { name: 'Javier Mascherano', club: 'FC Barcelona', team: 'Argentina', position: 'Pivote / Defensa' },
    { name: 'Sergio Busquets', club: 'FC Barcelona', team: 'España', position: 'Pivote' },
    { name: 'Xavi Hernández', club: 'FC Barcelona', team: 'España', position: 'Mediocentro' },
    { name: 'Andrés Iniesta', club: 'FC Barcelona', team: 'España', position: 'Mediocentro' },
    { name: 'Cesc Fàbregas', club: 'Arsenal', team: 'España', position: 'Mediocentro' },
    { name: 'David Silva', club: 'Manchester City', team: 'España', position: 'Mediocentro ofensivo' },
    { name: 'Toni Kroos', club: 'Real Madrid', team: 'Alemania', position: 'Mediocentro' },
    { name: 'Mesut Özil', club: 'Real Madrid', team: 'Alemania', position: 'Mediocentro ofensivo' },
    { name: 'Paul Pogba', club: 'Juventus', team: 'Francia', position: 'Mediocentro' },
    { name: 'N’Golo Kanté', club: 'Chelsea', team: 'Francia', position: 'Pivote' },
    { name: 'Declan Rice', club: 'Arsenal', team: 'Inglaterra', position: 'Pivote' },
    { name: 'Steven Gerrard', club: 'Liverpool', team: 'Inglaterra', position: 'Mediocentro' },
    { name: 'Frank Lampard', club: 'Chelsea', team: 'Inglaterra', position: 'Mediocentro' },
    { name: 'Andrea Pirlo', club: 'AC Milan', team: 'Italia', position: 'Mediocentro' },
    { name: 'Gennaro Gattuso', club: 'AC Milan', team: 'Italia', position: 'Pivote' },
    { name: 'Francesco Totti', club: 'AS Roma', team: 'Italia', position: 'Mediapunta / Delantero' },
    { name: 'Alessandro Del Piero', club: 'Juventus', team: 'Italia', position: 'Delantero' },
    { name: 'Gabriel Batistuta', club: 'Fiorentina', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Ángel Di María', club: 'Real Madrid', team: 'Argentina', position: 'Extremo' },
    { name: 'Paulo Dybala', club: 'Juventus', team: 'Argentina', position: 'Mediapunta / Delantero' },
    { name: 'Gonzalo Higuaín', club: 'Napoli', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Carlos Tévez', club: 'Juventus', team: 'Argentina', position: 'Delantero' },
    { name: 'Juan Román Riquelme', club: 'Boca Juniors', team: 'Argentina', position: 'Mediocentro ofensivo' },
    { name: 'Diego Maradona', club: 'Napoli', team: 'Argentina', position: 'Mediapunta' },
    { name: 'Pelé', club: 'Santos FC', team: 'Brasil', position: 'Delantero' },
    { name: 'Ronaldo Nazário', club: 'FC Barcelona', team: 'Brasil', position: 'Delantero centro' },
    { name: 'Ronaldinho', club: 'FC Barcelona', team: 'Brasil', position: 'Mediapunta' },
    { name: 'Rivaldo', club: 'FC Barcelona', team: 'Brasil', position: 'Mediapunta' },
    { name: 'Kaká', club: 'AC Milan', team: 'Brasil', position: 'Mediocentro ofensivo' },
    { name: 'Romário', club: 'FC Barcelona', team: 'Brasil', position: 'Delantero centro' },
    { name: 'George Best', club: 'Manchester United', team: 'Irlanda del Norte', position: 'Extremo' },
    { name: 'Bobby Charlton', club: 'Manchester United', team: 'Inglaterra', position: 'Mediapunta' },
    { name: 'Paul Scholes', club: 'Manchester United', team: 'Inglaterra', position: 'Mediocentro' },
    { name: 'Ryan Giggs', club: 'Manchester United', team: 'Gales', position: 'Extremo' },
    { name: 'Wayne Rooney', club: 'Manchester United', team: 'Inglaterra', position: 'Delantero' },
    { name: 'David Beckham', club: 'Manchester United', team: 'Inglaterra', position: 'Interior derecho' },
    { name: 'Rio Ferdinand', club: 'Manchester United', team: 'Inglaterra', position: 'Defensa central' },
    { name: 'Peter Schmeichel', club: 'Manchester United', team: 'Dinamarca', position: 'Portero' },
    { name: 'Eric Cantona', club: 'Manchester United', team: 'Francia', position: 'Delantero' },
    { name: 'Ruud van Nistelrooy', club: 'Manchester United', team: 'Países Bajos', position: 'Delantero centro' },
    { name: 'Dennis Bergkamp', club: 'Arsenal', team: 'Países Bajos', position: 'Mediapunta' },
    { name: 'Patrick Vieira', club: 'Arsenal', team: 'Francia', position: 'Pivote' },
    { name: 'Thierry Henry', club: 'Arsenal', team: 'Francia', position: 'Delantero' },
    { name: 'Sol Campbell', club: 'Arsenal', team: 'Inglaterra', position: 'Defensa central' },
    { name: 'Olivier Giroud', club: 'Arsenal', team: 'Francia', position: 'Delantero centro' },
    { name: 'Alexis Sánchez', club: 'Arsenal', team: 'Chile', position: 'Delantero' },
    { name: 'Bukayo Saka', club: 'Arsenal', team: 'Inglaterra', position: 'Extremo' },
    { name: 'Martin Ødegaard', club: 'Arsenal', team: 'Noruega', position: 'Mediocentro ofensivo' },
    { name: 'Raheem Sterling', club: 'Manchester City', team: 'Inglaterra', position: 'Extremo' },
    { name: 'Reece James', club: 'Chelsea', team: 'Inglaterra', position: 'Lateral derecho' },
    { name: 'Mason Mount', club: 'Chelsea', team: 'Inglaterra', position: 'Mediocentro ofensivo' },
    { name: 'Didier Drogba', club: 'Chelsea', team: 'Costa de Marfil', position: 'Delantero centro' },
    { name: 'John Terry', club: 'Chelsea', team: 'Inglaterra', position: 'Defensa central' },
    { name: 'Petr Čech', club: 'Chelsea', team: 'República Checa', position: 'Portero' },
    { name: 'Claude Makélélé', club: 'Real Madrid', team: 'Francia', position: 'Pivote' },
    { name: 'Arjen Robben', club: 'Bayern Múnich', team: 'Países Bajos', position: 'Extremo' },
    { name: 'Eden Hazard', club: 'Chelsea', team: 'Bélgica', position: 'Extremo' },
    { name: 'Fernando Torres', club: 'Liverpool', team: 'España', position: 'Delantero centro' },
    { name: 'Samuel Eto’o', club: 'FC Barcelona', team: 'Camerún', position: 'Delantero centro' },
    { name: 'Riyad Mahrez', club: 'Manchester City', team: 'Argelia', position: 'Extremo' },
    { name: 'Sergio Agüero', club: 'Manchester City', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Vincent Kompany', club: 'Manchester City', team: 'Bélgica', position: 'Defensa central' },
    { name: 'Mario Balotelli', club: 'Manchester City', team: 'Italia', position: 'Delantero centro' },
    { name: 'Marco Verratti', club: 'Paris Saint-Germain', team: 'Italia', position: 'Mediocentro' },
    { name: 'Achraf Hakimi', club: 'Inter de Milán', team: 'Marruecos', position: 'Lateral derecho' },
    { name: 'Zlatan Ibrahimović', club: 'Inter de Milán', team: 'Suecia', position: 'Delantero centro' },
    { name: 'Fabio Cannavaro', club: 'Juventus', team: 'Italia', position: 'Defensa central' },
    { name: 'Clarence Seedorf', club: 'AC Milan', team: 'Países Bajos', position: 'Mediocentro' },
    { name: 'Wesley Sneijder', club: 'Inter de Milán', team: 'Países Bajos', position: 'Mediocentro ofensivo' },
    { name: 'Johan Cruyff', club: 'Ajax', team: 'Países Bajos', position: 'Delantero' },
    { name: 'Hugo Sánchez', club: 'Real Madrid', team: 'México', position: 'Delantero centro' },
    { name: 'Guillermo Ochoa', club: 'Club América', team: 'México', position: 'Portero' },

    // Agregados 1.1
    { name: 'Adriano', club: 'Inter de Milán', team: 'Brasil', position: 'Delantero centro' },
    { name: 'Alan Shearer', club: 'Newcastle United', team: 'Inglaterra', position: 'Delantero centro' },
    { name: 'Álvaro Morata', club: 'Juventus', team: 'España', position: 'Delantero centro' },
    { name: 'Ander Herrera', club: 'Athletic Club', team: 'España', position: 'Mediocentro' },
    { name: 'Andriy Shevchenko', club: 'AC Milan', team: 'Ucrania', position: 'Delantero centro' },
    { name: 'Ashley Cole', club: 'Chelsea', team: 'Inglaterra', position: 'Lateral izquierdo' },
    { name: 'Bastian Schweinsteiger', club: 'Bayern Múnich', team: 'Alemania', position: 'Mediocentro' },
    { name: 'Bojan Krkić', club: 'FC Barcelona', team: 'España', position: 'Delantero' },
    { name: 'Carlos Valderrama', club: 'Deportivo Cali', team: 'Colombia', position: 'Mediocentro ofensivo' },
    { name: 'César Azpilicueta', club: 'Chelsea', team: 'España', position: 'Defensa / Lateral' },
    { name: 'Ciro Immobile', club: 'Lazio', team: 'Italia', position: 'Delantero centro' },
    { name: 'Claudio Bravo', club: 'FC Barcelona', team: 'Chile', position: 'Portero' },
    { name: 'Claudio Caniggia', club: 'Atalanta', team: 'Argentina', position: 'Delantero' },
    { name: 'Cristian "Cuti" Romero', club: 'Tottenham Hotspur', team: 'Argentina', position: 'Defensa central' },
    { name: 'Danilo', club: 'Juventus', team: 'Brasil', position: 'Lateral / Defensa' },
    { name: 'Darwin Núñez', club: 'Liverpool', team: 'Uruguay', position: 'Delantero centro' },
    { name: 'David Alaba', club: 'Bayern Múnich', team: 'Austria', position: 'Defensa / Lateral' },
    { name: 'David Trezeguet', club: 'Juventus', team: 'Francia', position: 'Delantero centro' },
    { name: 'David Villa', club: 'Valencia CF', team: 'España', position: 'Delantero' },
    { name: 'Diego Forlán', club: 'Atlético de Madrid', team: 'Uruguay', position: 'Delantero' },
    { name: 'Diego Milito', club: 'Inter de Milán', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Diego Simeone', club: 'Atlético de Madrid', team: 'Argentina', position: 'Mediocentro' },
    { name: 'Éder Militão', club: 'Real Madrid', team: 'Brasil', position: 'Defensa central' },
    { name: 'Edin Džeko', club: 'VfL Wolfsburg', team: 'Bosnia y Herzegovina', position: 'Delantero centro' },
    { name: 'Eduardo Camavinga', club: 'Real Madrid', team: 'Francia', position: 'Mediocentro' },
    { name: 'Emiliano "Dibu" Martínez', club: 'Aston Villa', team: 'Argentina', position: 'Portero' },
    { name: 'Enzo Fernández', club: 'Benfica', team: 'Argentina', position: 'Mediocentro' },
    { name: 'Enzo Francescoli', club: 'River Plate', team: 'Uruguay', position: 'Mediapunta' },
    { name: 'Eusébio', club: 'Benfica', team: 'Portugal', position: 'Delantero' },
    { name: 'Federico Chiesa', club: 'Juventus', team: 'Italia', position: 'Extremo' },
    { name: 'Federico Valverde', club: 'Real Madrid', team: 'Uruguay', position: 'Mediocentro' },
    { name: 'Ferenc Puskás', club: 'Real Madrid', team: 'Hungría', position: 'Delantero' },
    { name: 'Franz Beckenbauer', club: 'Bayern Múnich', team: 'Alemania', position: 'Líbero' },
    { name: 'George Weah', club: 'AC Milan', team: 'Liberia', position: 'Delantero centro' },
    { name: 'Gerd Müller', club: 'Bayern Múnich', team: 'Alemania', position: 'Delantero centro' },
    { name: 'Giorgian De Arrascaeta', club: 'Flamengo', team: 'Uruguay', position: 'Mediocentro ofensivo' },
    { name: 'Guti', club: 'Real Madrid', team: 'España', position: 'Mediocentro' },
    { name: 'Harry Kane', club: 'Tottenham Hotspur', team: 'Inglaterra', position: 'Delantero centro' },
    { name: 'Hernán Crespo', club: 'Parma', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Iago Aspas', club: 'Celta de Vigo', team: 'España', position: 'Delantero' },
    { name: 'Iván Zamorano', club: 'Real Madrid', team: 'Chile', position: 'Delantero centro' },
    { name: 'Jack Grealish', club: 'Manchester City', team: 'Inglaterra', position: 'Extremo' },
    { name: 'James Maddison', club: 'Tottenham Hotspur', team: 'Inglaterra', position: 'Mediocentro ofensivo' },
    { name: 'James Rodríguez', club: 'Real Madrid', team: 'Colombia', position: 'Mediocentro ofensivo' },
    { name: 'Javier Saviola', club: 'River Plate', team: 'Argentina', position: 'Delantero' },
    { name: 'Javier Zanetti', club: 'Inter de Milán', team: 'Argentina', position: 'Lateral / Interior' },
    { name: 'John Stones', club: 'Manchester City', team: 'Inglaterra', position: 'Defensa central' },
    { name: 'José Luis Chilavert', club: 'Vélez Sarsfield', team: 'Paraguay', position: 'Portero' },
    { name: 'Juan Pablo Aimar', club: 'Valencia CF', team: 'Argentina', position: 'Mediocentro ofensivo' },
    { name: 'Juan Sebastián Verón', club: 'Lazio', team: 'Argentina', position: 'Mediocentro' },
    { name: 'Jude Bellingham', club: 'Real Madrid', team: 'Inglaterra', position: 'Mediocentro' },
    { name: 'Julián Álvarez', club: 'Manchester City', team: 'Argentina', position: 'Delantero' },
    { name: 'Kasper Schmeichel', club: 'Leicester City', team: 'Dinamarca', position: 'Portero' },
    { name: 'Keylor Navas', club: 'Real Madrid', team: 'Costa Rica', position: 'Portero' },
    { name: 'Khvicha Kvaratskhelia', club: 'Napoli', team: 'Georgia', position: 'Extremo' },
    { name: 'Kieran Trippier', club: 'Newcastle United', team: 'Inglaterra', position: 'Lateral derecho' },
    { name: 'Lautaro Martínez', club: 'Inter de Milán', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Lev Yashin', club: 'Dynamo Moscow', team: 'Unión Soviética', position: 'Portero' },
    { name: 'Lisandro Martínez', club: 'Manchester United', team: 'Argentina', position: 'Defensa central' },
    { name: 'Lothar Matthäus', club: 'Inter de Milán', team: 'Alemania', position: 'Mediocentro / Líbero' },
    { name: 'Lucas Paquetá', club: 'West Ham United', team: 'Brasil', position: 'Mediocentro ofensivo' },
    { name: 'Luís Figo', club: 'Real Madrid', team: 'Portugal', position: 'Extremo' },
    { name: 'Luis Suárez', club: 'FC Barcelona', team: 'Uruguay', position: 'Delantero centro' },
    { name: 'Manuel Akanji', club: 'Manchester City', team: 'Suiza', position: 'Defensa central' },
    { name: 'Marcelo Bielsa', club: 'Athletic Club', team: 'Argentina', position: 'Entrenador' },
    { name: 'Marco Asensio', club: 'Real Madrid', team: 'España', position: 'Extremo' },
    { name: 'Marcus Rashford', club: 'Manchester United', team: 'Inglaterra', position: 'Delantero' },
    { name: 'Marcus Thuram', club: 'Inter de Milán', team: 'Francia', position: 'Delantero' },
    { name: 'Martín Palermo', club: 'Boca Juniors', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Mats Hummels', club: 'Borussia Dortmund', team: 'Alemania', position: 'Defensa central' },
    { name: 'Mauro Icardi', club: 'Inter de Milán', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Michael Owen', club: 'Liverpool', team: 'Inglaterra', position: 'Delantero centro' },
    { name: 'Michel Platini', club: 'Juventus', team: 'Francia', position: 'Mediocentro ofensivo' },
    { name: 'Miroslav Klose', club: 'Bayern Múnich', team: 'Alemania', position: 'Delantero centro' },
    { name: 'Nani', club: 'Manchester United', team: 'Portugal', position: 'Extremo' },
    { name: 'Nicolò Barella', club: 'Inter de Milán', team: 'Italia', position: 'Mediocentro' },
    { name: 'Oliver Kahn', club: 'Bayern Múnich', team: 'Alemania', position: 'Portero' },
    { name: 'Patrick Kluivert', club: 'FC Barcelona', team: 'Países Bajos', position: 'Delantero centro' },
    { name: 'Philipp Lahm', club: 'Bayern Múnich', team: 'Alemania', position: 'Lateral / Pivote' },
    { name: 'Radamel Falcao', club: 'Atlético de Madrid', team: 'Colombia', position: 'Delantero centro' },
    { name: 'Raúl González', club: 'Real Madrid', team: 'España', position: 'Delantero' },
    { name: 'René Higuita', club: 'Atlético Nacional', team: 'Colombia', position: 'Portero' },
    { name: 'Ricardo Quaresma', club: 'Porto', team: 'Portugal', position: 'Extremo' },
    { name: 'Rúben Dias', club: 'Manchester City', team: 'Portugal', position: 'Defensa central' },
    { name: 'Robin van Persie', club: 'Arsenal', team: 'Países Bajos', position: 'Delantero centro' },
    { name: 'Rodri', club: 'Manchester City', team: 'España', position: 'Pivote' },
    { name: 'Ronald Araújo', club: 'FC Barcelona', team: 'Uruguay', position: 'Defensa central' },
    { name: 'Ronald Koeman', club: 'FC Barcelona', team: 'Países Bajos', position: 'Líbero' },
    { name: 'Samuel Umtiti', club: 'FC Barcelona', team: 'Francia', position: 'Defensa central' },
    { name: 'Sandro Tonali', club: 'AC Milan', team: 'Italia', position: 'Mediocentro' },
    { name: 'Sócrates', club: 'Corinthians', team: 'Brasil', position: 'Mediocentro ofensivo' },
    { name: 'Son Heung-min', club: 'Tottenham Hotspur', team: 'Corea del Sur', position: 'Delantero' },
    { name: 'Thiago Alcântara', club: 'Bayern Múnich', team: 'España', position: 'Mediocentro' },
    { name: 'Thomas Müller', club: 'Bayern Múnich', team: 'Alemania', position: 'Mediapunta / Delantero' },
    { name: 'Timo Werner', club: 'RB Leipzig', team: 'Alemania', position: 'Delantero' },
    { name: 'Trent Alexander-Arnold', club: 'Liverpool', team: 'Inglaterra', position: 'Lateral derecho' },
    { name: 'Victor Osimhen', club: 'Napoli', team: 'Nigeria', position: 'Delantero centro' },
    { name: 'Victor Valdés', club: 'FC Barcelona', team: 'España', position: 'Portero' },
    { name: 'Walter Samuel', club: 'Inter de Milán', team: 'Argentina', position: 'Defensa central' },
    { name: 'Xabi Alonso', club: 'Real Madrid', team: 'España', position: 'Pivote' },
    { name: 'Yaya Touré', club: 'Manchester City', team: 'Costa de Marfil', position: 'Mediocentro' },
    { name: 'Yerry Mina', club: 'Everton', team: 'Colombia', position: 'Defensa central' },
    { name: 'Zinedine Zidane', club: 'Real Madrid', team: 'Francia', position: 'Mediocentro ofensivo' },

    // Agregados 1.2 Actuales
    { name: 'Lamine Yamal', club: 'FC Barcelona', team: 'España', position: 'Extremo' },
    { name: 'Cole Palmer', club: 'Chelsea', team: 'Inglaterra', position: 'Mediocentro ofensivo' },
    { name: 'Alexander Isak', club: 'Newcastle United', team: 'Suecia', position: 'Delantero centro' },
    { name: 'Michael Olise', club: 'Crystal Palace', team: 'Francia', position: 'Extremo' },
    { name: 'Alexis Mac Allister', club: 'Liverpool', team: 'Argentina', position: 'Mediocentro' },
    { name: 'Désiré Doué', club: 'Stade Rennais', team: 'Francia', position: 'Mediocentro ofensivo' },
    { name: 'Moisés Caicedo', club: 'Chelsea', team: 'Ecuador', position: 'Pivote' },
    { name: 'Rodrygo', club: 'Real Madrid', team: 'Brasil', position: 'Extremo' },
    { name: 'Raphinha', club: 'FC Barcelona', team: 'Brasil', position: 'Extremo' },
    { name: 'Ousmane Dembélé', club: 'FC Barcelona', team: 'Francia', position: 'Extremo' },
    { name: 'Pau Cubarsí', club: 'FC Barcelona', team: 'España', position: 'Defensa central' },
    { name: 'João Neves', club: 'Benfica', team: 'Portugal', position: 'Mediocentro' },
    { name: 'Bruno Guimarães', club: 'Newcastle United', team: 'Brasil', position: 'Mediocentro' },
    { name: 'William Saliba', club: 'Arsenal', team: 'Francia', position: 'Defensa central' },
    { name: 'Vitinha', club: 'Paris Saint-Germain', team: 'Portugal', position: 'Mediocentro' },
    { name: 'Dominik Szoboszlai', club: 'Liverpool', team: 'Hungría', position: 'Mediocentro ofensivo' },
    { name: 'Alessandro Bastoni', club: 'Inter de Milán', team: 'Italia', position: 'Defensa central' },
    { name: 'Hugo Ekitiké', club: 'Eintracht Frankfurt', team: 'Francia', position: 'Delantero centro' },
    { name: 'Ryan Gravenberch', club: 'Liverpool', team: 'Países Bajos', position: 'Mediocentro' },
    { name: 'Josko Gvardiol', club: 'Manchester City', team: 'Croacia', position: 'Defensa central' },
    { name: 'Omar Marmoush', club: 'Eintracht Frankfurt', team: 'Egipto', position: 'Delantero' },
    { name: 'Gabriel Magalhães', club: 'Arsenal', team: 'Brasil', position: 'Defensa central' },
    { name: 'Aurélien Tchouaméni', club: 'Real Madrid', team: 'Francia', position: 'Pivote' },
    { name: 'Viktor Gyökeres', club: 'Sporting CP', team: 'Suecia', position: 'Delantero centro' },
    { name: 'Nico Williams', club: 'Athletic Club', team: 'España', position: 'Extremo' },
    { name: 'Bradley Barcola', club: 'Paris Saint-Germain', team: 'Francia', position: 'Extremo' },
    { name: 'Benjamin Sesko', club: 'RB Leipzig', team: 'Eslovenia', position: 'Delantero centro' },
    { name: 'Nuno Mendes', club: 'Paris Saint-Germain', team: 'Portugal', position: 'Lateral izquierdo' },
    { name: 'Xavi Simons', club: 'RB Leipzig', team: 'Países Bajos', position: 'Mediocentro ofensivo' },
    { name: 'Luis Díaz', club: 'Liverpool', team: 'Colombia', position: 'Extremo' },
    { name: 'Cody Gakpo', club: 'Liverpool', team: 'Países Bajos', position: 'Delantero' },
    { name: 'Rafael Leão', club: 'AC Milan', team: 'Portugal', position: 'Extremo' },
    { name: 'Willian Pacho', club: 'PSG', team: 'Ecuador', position: 'Defensa central' },
    { name: 'Jules Koundé', club: 'FC Barcelona', team: 'Francia', position: 'Defensa / Lateral' },
    { name: 'Kai Havertz', club: 'Arsenal', team: 'Alemania', position: 'Mediapunta / Delantero' },
    { name: 'Estêvão', club: 'Palmeiras', team: 'Brasil', position: 'Extremo' },
    { name: 'Dean Huijsen', club: 'Juventus', team: 'España', position: 'Defensa central' },
    { name: 'Alejandro Balde', club: 'FC Barcelona', team: 'España', position: 'Lateral izquierdo' },
    { name: 'Oihan Sancet', club: 'Athletic Club', team: 'España', position: 'Mediocentro ofensivo' },
    { name: 'Matheus Cunha', club: 'Wolverhampton', team: 'Brasil', position: 'Delantero' },
    { name: 'Tijjani Reijnders', club: 'AC Milan', team: 'Países Bajos', position: 'Mediocentro' },
    { name: 'Martín Zubimendi', club: 'Real Sociedad', team: 'España', position: 'Pivote' },
    { name: 'Ademola Lookman', club: 'Atalanta', team: 'Nigeria', position: 'Delantero' },
    { name: 'Ibrahima Konaté', club: 'Liverpool', team: 'Francia', position: 'Defensa central' },
    { name: 'Dani Olmo', club: 'RB Leipzig', team: 'España', position: 'Mediocentro ofensivo' },
    { name: 'Leny Yoro', club: 'LOSC Lille', team: 'Francia', position: 'Defensa central' },
    { name: 'Ethan Nwaneri', club: 'Arsenal', team: 'Inglaterra', position: 'Mediocentro ofensivo' },
    { name: 'Warren Zaïre-Emery', club: 'Paris Saint-Germain', team: 'Francia', position: 'Mediocentro' },
    { name: 'Aleksandar Pavlovic', club: 'Bayern Múnich', team: 'Alemania', position: 'Pivote' },
    { name: 'Gabriel Martinelli', club: 'Arsenal', team: 'Brasil', position: 'Extremo' },
    { name: 'Levi Colwill', club: 'Chelsea', team: 'Inglaterra', position: 'Defensa central' },
    { name: 'Álex Baena', club: 'Villarreal CF', team: 'España', position: 'Interior / Extremo' },
    { name: 'Morgan Rogers', club: 'Aston Villa', team: 'Inglaterra', position: 'Mediocentro ofensivo' },
    { name: 'Eberechi Eze', club: 'Crystal Palace', team: 'Inglaterra', position: 'Mediocentro ofensivo' },
    { name: 'Jurriën Timber', club: 'Arsenal', team: 'Países Bajos', position: 'Defensa / Lateral' },
    { name: 'Bryan Mbeumo', club: 'Brentford', team: 'Camerún', position: 'Extremo' },
    { name: 'Kenan Yıldız', club: 'Juventus', team: 'Turquía', position: 'Mediapunta' },
    { name: 'Kobbie Mainoo', club: 'Manchester United', team: 'Inglaterra', position: 'Mediocentro' },
    { name: 'Nicolas Jackson', club: 'Chelsea', team: 'Senegal', position: 'Delantero centro' },
    { name: 'Savinho', club: 'Girona', team: 'Brasil', position: 'Extremo' },
    { name: 'Jamie Gittens', club: 'Borussia Dortmund', team: 'Inglaterra', position: 'Extremo' },
    { name: 'Jarrad Branthwaite', club: 'Everton', team: 'Inglaterra', position: 'Defensa central' },
    { name: 'Piero Hincapié', club: 'Bayer Leverkusen', team: 'Ecuador', position: 'Defensa central' },
    { name: 'Fermín López', club: 'FC Barcelona', team: 'España', position: 'Mediocentro ofensivo' },
    { name: 'João Pedro', club: 'Brighton', team: 'Brasil', position: 'Delantero' },
    { name: 'Micky van de Ven', club: 'Tottenham Hotspur', team: 'Países Bajos', position: 'Defensa central' },
    { name: 'Bremer', club: 'Juventus', team: 'Brasil', position: 'Defensa central' },
    { name: 'Pedro Neto', club: 'Wolverhampton', team: 'Portugal', position: 'Extremo' },

    // Agregados 1.3
    { name: 'Edinson Cavani', club: 'Paris Saint-Germain', team: 'Uruguay', position: 'Delantero centro' },
    { name: 'Juan Cruz Portillo', club: 'Talleres de Córdoba', team: 'Argentina', position: 'Lateral / Interior' },
    { name: 'Gonzalo Montiel', club: 'River Plate', team: 'Argentina', position: 'Lateral derecho' },
    { name: 'Marcos Acuña', club: 'Sevilla', team: 'Argentina', position: 'Lateral izquierdo' },
    { name: 'Pep Guardiola', club: 'FC Barcelona', team: 'España', position: 'Entrenador' },
    { name: 'Luis Enrique', club: 'FC Barcelona', team: 'España', position: 'Entrenador' },
    { name: 'José Mourinho', club: 'Inter de Milán', team: 'Portugal', position: 'Entrenador' },
    { name: 'Alex Ferguson', club: 'Manchester United', team: 'Escocia', position: 'Entrenador' },
    { name: 'Hansi Flick', club: 'Bayern Múnich', team: 'Alemania', position: 'Entrenador' },
    { name: 'Nicolás Otamendi', club: 'Manchester City', team: 'Argentina', position: 'Defensa central' },
    { name: 'Javier Mascherano', club: 'FC Barcelona', team: 'Argentina', position: 'Pivote / Defensa' },
    { name: 'Franco Mastantuono', club: 'River Plate', team: 'Argentina', position: 'Mediocentro ofensivo' },
    { name: 'Endrick', club: 'Palmeiras', team: 'Brasil', position: 'Delantero' },
    { name: 'Conor Gallagher', club: 'Chelsea', team: 'Inglaterra', position: 'Mediocentro' },
    { name: 'Antony', club: 'Ajax', team: 'Brasil', position: 'Extremo derecho' },
    { name: 'Nacho Fernández', club: 'River Plate', team: 'Argentina', position: 'Mediocentro' },
    { name: 'Enzo Pérez', club: 'River Plate', team: 'Argentina', position: 'Mediocentro' },
    { name: 'Marcos Rojo', club: 'Manchester United', team: 'Argentina', position: 'Defensa central' },
    { name: 'Sergio "Chiquito" Romero', club: 'Manchester United', team: 'Argentina', position: 'Portero' },
    { name: 'Franco Armani', club: 'River Plate', team: 'Argentina', position: 'Portero' },
    { name: 'Miguel Merentiel', club: 'Boca Juniors', team: 'Uruguay', position: 'Delantero centro' },
    { name: 'Matthijs de Ligt', club: 'Ajax', team: 'Países Bajos', position: 'Defensa central' },
    { name: 'Bryan Mbeumo', club: 'Brentford', team: 'Camerún', position: 'Extremo' },
    { name: 'Alexander Sørloth', club: 'Villarreal CF', team: 'Noruega', position: 'Delantero centro' },
    { name: 'Éder Militão', club: 'Real Madrid', team: 'Brasil', position: 'Defensa central' },
    { name: 'Antonio Rüdiger', club: 'Real Madrid', team: 'Alemania', position: 'Defensa central' },
    { name: 'David Alaba', club: 'Bayern Múnich', team: 'Austria', position: 'Defensa / Lateral' },
    { name: 'Daniel Carvajal', club: 'Real Madrid', team: 'España', position: 'Lateral derecho' },
    { name: 'Arda Güler', club: 'Real Madrid', team: 'Turquía', position: 'Mediocentro ofensivo' },
    { name: 'Joan García', club: 'RCD Espanyol', team: 'España', position: 'Portero' },
    { name: 'Ferran Torres', club: 'Manchester City', team: 'España', position: 'Extremo' },
    { name: 'Íñigo Martínez', club: 'FC Barcelona', team: 'España', position: 'Defensa central' },
    { name: 'Ansu Fati', club: 'FC Barcelona', team: 'España', position: 'Extremo izquierdo' },
    { name: 'Maximiliano Salas', club: 'Racing Club', team: 'Argentina', position: 'Delantero' },
    { name: 'Adrián "Maravilla" Martínez', club: 'Racing Club', team: 'Argentina', position: 'Delantero centro' },
    { name: 'Gustavo Gómez', club: 'Palmeiras', team: 'Paraguay', position: 'Defensa central' }
];

// --- NUEVA LISTA DE CLUBES ---
const clubData = [
    { name: 'Real Madrid', country: 'España', type: 'Club' },
    { name: 'FC Barcelona', country: 'España', type: 'Club' },
    { name: 'Atlético de Madrid', country: 'España', type: 'Club' },
    { name: 'Sevilla', country: 'España', type: 'Club' },
    { name: 'Manchester United', country: 'Inglaterra', type: 'Club' },
    { name: 'Manchester City', country: 'Inglaterra', type: 'Club' },
    { name: 'Liverpool', country: 'Inglaterra', type: 'Club' },
    { name: 'Chelsea', country: 'Inglaterra', type: 'Club' },
    { name: 'Arsenal', country: 'Inglaterra', type: 'Club' },
    { name: 'Tottenham Hotspur', country: 'Inglaterra', type: 'Club' },
    { name: 'Bayern Múnich', country: 'Alemania', type: 'Club' },
    { name: 'Borussia Dortmund', country: 'Alemania', type: 'Club' },
    { name: 'RB Leipzig', country: 'Alemania', type: 'Club' },
    { name: 'Juventus', country: 'Italia', type: 'Club' },
    { name: 'Inter de Milán', country: 'Italia', type: 'Club' },
    { name: 'AC Milan', country: 'Italia', type: 'Club' },
    { name: 'Napoli', country: 'Italia', type: 'Club' },
    { name: 'AS Roma', country: 'Italia', type: 'Club' },
    { name: 'Paris Saint-Germain', country: 'Francia', type: 'Club' },
    { name: 'Olympique de Lyon', country: 'Francia', type: 'Club' },
    { name: 'Olympique de Marsella', country: 'Francia', type: 'Club' },
    { name: 'Ajax', country: 'Países Bajos', type: 'Club' },
    { name: 'PSV Eindhoven', country: 'Países Bajos', type: 'Club' },
    { name: 'Porto', country: 'Portugal', type: 'Club' },
    { name: 'Benfica', country: 'Portugal', type: 'Club' },
    { name: 'Sporting CP', country: 'Portugal', type: 'Club' },
    { name: 'Boca Juniors', country: 'Argentina', type: 'Club' },
    { name: 'River Plate', country: 'Argentina', type: 'Club' },
    { name: 'Flamengo', country: 'Brasil', type: 'Club' },
    { name: 'Palmeiras', country: 'Brasil', type: 'Club' },
];

app.use(express.static(__dirname));

const rooms = {};

function generateRoomCode() {
    let code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function getDataSource(gameMode) {
    if (gameMode === 'playersOnly') {
        return characterData;
    } else if (gameMode === 'clubsOnly') {
        return clubData;
    } else { // playersAndClubs or default
        return [...characterData, ...clubData];
    }
}

function startWordPhase(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    
    room.gameState = 'wordPhase';
    room.votes = {};
    room.wordsSpoken = [];
    if (room.votingTimer) clearInterval(room.votingTimer);

    const alivePlayers = room.players.filter(p => p.isAlive);
    room.currentTurnIndex = Math.floor(Math.random() * alivePlayers.length);
    const currentPlayer = alivePlayers[room.currentTurnIndex];
    io.to(roomCode).emit('wordPhaseStart', {
        currentPlayerName: currentPlayer.name,
        currentPlayerId: currentPlayer.id,
        wordsSpoken: []
    });
}

function startVotingTimer(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.votingTimer) return;
    room.timeRemaining = room.options.votingTime;

    room.votingTimer = setInterval(() => {
        room.timeRemaining--;
        io.to(roomCode).emit('timerUpdate', { timeRemaining: room.timeRemaining });
        if (room.timeRemaining <= 0) {
            clearInterval(room.votingTimer);
            room.votingTimer = null;
            io.to(roomCode).emit('timeUp');
            setTimeout(() => tallyVotes(roomCode), 2000);
        }
    }, 1000);
}

function tallyVotes(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const voteCounts = {};
    Object.values(room.votes).forEach(votedForId => {
        voteCounts[votedForId] = (voteCounts[votedForId] || 0) + 1;
    });

    let maxVotes = 0;
    let ejectedPlayerId = null;
    for (const playerId in voteCounts) {
        if (voteCounts[playerId] > maxVotes) {
            maxVotes = voteCounts[playerId];
            ejectedPlayerId = playerId;
        }
    }

    const idsWithMaxVotes = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
    
    if (idsWithMaxVotes.length > 1 || maxVotes === 0) {
        io.to(roomCode).emit('roundResult', { message: '¡Empate! Nadie fue expulsado.' });
        setTimeout(() => startWordPhase(roomCode), 4000);
        return;
    }

    const ejectedPlayer = room.players.find(p => p.id === ejectedPlayerId);
    if (ejectedPlayer) {
        ejectedPlayer.isAlive = false;
        const wasImpostor = room.impostorIds.includes(ejectedPlayer.id);
        io.to(roomCode).emit('roundResult', { message: `${ejectedPlayer.name} fue expulsado.`, ejectedPlayer, wasImpostor });

        const livingPlayers = room.players.filter(p => p.isAlive);
        const livingImpostors = livingPlayers.filter(p => room.impostorIds.includes(p.id));
        const livingCrewmates = livingPlayers.filter(p => !room.impostorIds.includes(p.id));
        const impostorNames = room.players.filter(p => room.impostorIds.includes(p.id)).map(p => p.name).join(', ');

        if (livingImpostors.length === 0) {
            room.gameState = 'gameOver';
            io.to(roomCode).emit('gameOver', { winner: 'crewmates', ejectedPlayerName: ejectedPlayer.name, impostorName: impostorNames });
        } else if (livingImpostors.length >= livingCrewmates.length) {
            room.gameState = 'gameOver';
            io.to(roomCode).emit('gameOver', { winner: 'impostors', ejectedPlayerName: ejectedPlayer.name, impostorName: impostorNames });
        } else {
            setTimeout(() => startWordPhase(roomCode), 4000);
        }
    }
}

io.on('connection', (socket) => {
    socket.on('createRoom', ({ playerName }) => {
        let roomCode = generateRoomCode();
        while (rooms[roomCode]) { roomCode = generateRoomCode(); }

        socket.join(roomCode);
        rooms[roomCode] = {
            hostId: socket.id,
            players: [{ id: socket.id, name: playerName, isAlive: true }],
            gameState: 'lobby',
            votes: {},
            impostorIds: [],
            options: {
                gameMode: 'playersOnly',
                impostorCount: 1,
                votingTime: 90,
                cluesEnabled: false,
                clueProbability: 5,
                confusedCrewmateProbability: 0
            }
        };

        const room = rooms[roomCode];
        socket.emit('roomCreated', { roomCode });
        io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
        socket.emit('gameOptionsUpdated', room.options);
    });

    socket.on('joinRoom', ({ playerName, roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return socket.emit('error', 'La sala no existe.');
        if (room.gameState !== 'lobby') return socket.emit('error', 'La partida ya ha comenzado.');
        const nameExists = room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (nameExists) return socket.emit('error', 'Ese nombre ya está en uso.');

        socket.join(roomCode);
        room.players.push({ id: socket.id, name: playerName, isAlive: true });
        socket.emit('joinedLobby', { roomCode });
        io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
        socket.emit('gameOptionsUpdated', room.options);
    });

    socket.on('updateGameOptions', ({ roomCode, options }) => {
        const room = rooms[roomCode];
        if (room && room.hostId === socket.id) {
            room.options = options;
            io.to(roomCode).emit('gameOptionsUpdated', room.options);
        }
    });

    socket.on('startGame', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || socket.id !== room.hostId) return;

        const { impostorCount, gameMode } = room.options;
        const playerCount = room.players.length;

        if (impostorCount === 2 && playerCount < 7) return socket.emit('error', 'Se necesitan al menos 7 jugadores para 2 impostores.');
        if (impostorCount === 3 && playerCount < 9) return socket.emit('error', 'Se necesitan al menos 9 jugadores para 3 impostores.');
        if (playerCount < 3) return socket.emit('error', 'Se necesitan al menos 3 jugadores.');

        room.players.forEach(p => p.isAlive = true);
        room.impostorIds = [];
        let confusedCrewmateId = null;
        let fakeCharacterName = null;

        const sourceData = getDataSource(gameMode);
        const secretCharacterObject = sourceData[Math.floor(Math.random() * sourceData.length)];
        room.secretCharacter = secretCharacterObject;

        const playersCopy = [...room.players];
        for (let i = 0; i < impostorCount; i++) {
            const randomIndex = Math.floor(Math.random() * playersCopy.length);
            const impostor = playersCopy.splice(randomIndex, 1)[0];
            room.impostorIds.push(impostor.id);
        }
        
        const crewmates = room.players.filter(p => !room.impostorIds.includes(p.id));
        if (room.options.confusedCrewmateProbability > 0 && crewmates.length > 0 && secretCharacterObject.type === 'Player') {
            if (Math.random() < (room.options.confusedCrewmateProbability / 100)) {
                const potentialFakes = characterData.filter(char => 
                    char.name !== secretCharacterObject.name &&
                    (char.club === secretCharacterObject.club || char.team === secretCharacterObject.team || char.position === secretCharacterObject.position)
                );
                if (potentialFakes.length > 0) {
                    const fakeCharacter = potentialFakes[Math.floor(Math.random() * potentialFakes.length)];
                    fakeCharacterName = fakeCharacter.name;
                    const confusedCrewmate = crewmates[Math.floor(Math.random() * crewmates.length)];
                    confusedCrewmateId = confusedCrewmate.id;
                }
            }
        }

        room.players.forEach(player => {
            const isImpostor = room.impostorIds.includes(player.id);
            const isConfused = player.id === confusedCrewmateId;
            let impostorClue = null;
            let finalCharacterName = secretCharacterObject.name;

            if (isImpostor) {
                finalCharacterName = undefined;
                if (room.options.cluesEnabled && gameMode !== 'clubsOnly' && Math.random() < (room.options.clueProbability / 100)) {
                    const clues = secretCharacterObject.type === 'Player' 
                        ? [secretCharacterObject.club, secretCharacterObject.team, secretCharacterObject.position]
                        : [secretCharacterObject.country];
                    impostorClue = clues[Math.floor(Math.random() * clues.length)];
                }
            } else if (isConfused) {
                finalCharacterName = fakeCharacterName;
            }

            io.to(player.id).emit('assignRole', {
                role: isImpostor ? 'impostor' : 'crewmate',
                characterName: finalCharacterName,
                clue: impostorClue
            });
        });

        startWordPhase(roomCode);
    });
    
    socket.on('getOfflineGameData', ({ playerCount, playerNames, options }) => {
        if (!playerCount || !playerNames || !options || playerCount < 3) return;

        const { gameMode, impostorCount, cluesEnabled, clueProbability, confusedCrewmateProbability } = options;
        
        const sourceData = getDataSource(gameMode);
        const secretCharacterObject = sourceData[Math.floor(Math.random() * sourceData.length)];
        let fakeCharacterName = null;
        let confusedCrewmateIndex = -1;

        const allPlayerIndexes = Array.from({ length: playerCount }, (_, i) => i);
        const impostorIndexes = new Set();
        for (let i = 0; i < impostorCount; i++) {
            const randomIndex = Math.floor(Math.random() * allPlayerIndexes.length);
            const impostorIndex = allPlayerIndexes.splice(randomIndex, 1)[0];
            impostorIndexes.add(impostorIndex);
        }

        const crewmateIndexes = Array.from({ length: playerCount }, (_, i) => i).filter(i => !impostorIndexes.has(i));
        if (confusedCrewmateProbability > 0 && crewmateIndexes.length > 0 && secretCharacterObject.type === 'Player') {
            if (Math.random() < (confusedCrewmateProbability / 100)) {
                const potentialFakes = characterData.filter(char => 
                    char.name !== secretCharacterObject.name &&
                    (char.club === secretCharacterObject.club || char.team === secretCharacterObject.team || char.position === secretCharacterObject.position)
                );
                if (potentialFakes.length > 0) {
                    const fakeCharacter = potentialFakes[Math.floor(Math.random() * potentialFakes.length)];
                    fakeCharacterName = fakeCharacter.name;
                    confusedCrewmateIndex = crewmateIndexes[Math.floor(Math.random() * crewmateIndexes.length)];
                }
            }
        }
        
        const playersData = [];
        for (let i = 0; i < playerCount; i++) {
            const isImpostor = impostorIndexes.has(i);
            const isConfused = i === confusedCrewmateIndex;
            let impostorClue = null;
            let finalCharacterName = secretCharacterObject.name;

            if (isImpostor) {
                finalCharacterName = null;
                if (cluesEnabled && gameMode !== 'clubsOnly' && Math.random() < (clueProbability / 100)) {
                     const clues = secretCharacterObject.type === 'Player' 
                        ? [secretCharacterObject.club, secretCharacterObject.team, secretCharacterObject.position]
                        : [secretCharacterObject.country];
                    impostorClue = clues[Math.floor(Math.random() * clues.length)];
                }
            } else if (isConfused) {
                finalCharacterName = fakeCharacterName;
            }

            playersData.push({
                name: playerNames[i],
                role: isImpostor ? 'impostor' : 'crewmate',
                characterName: finalCharacterName,
                clue: impostorClue
            });
        }

        socket.emit('offlineGameDataReady', {
            secretCharacter: secretCharacterObject.name,
            players: playersData
        });
    });

    socket.on('sendMessage', ({ message, roomCode }) => {
        const room = rooms[roomCode];
        const player = room.players.find(p => p.id === socket.id);
        if(!room || !player) return;

        const senderName = player.name;
        io.to(roomCode).emit('newMessage', { senderName, message });
        
        if(room.gameState === 'wordPhase') {
            const alivePlayers = room.players.filter(p => p.isAlive);
            const currentPlayer = alivePlayers[room.currentTurnIndex];
            if(player.id === currentPlayer.id) {
                room.wordsSpoken.push({playerName: senderName, word: message});
                
                if(room.wordsSpoken.length >= alivePlayers.length) {
                    room.gameState = 'voting';
                    const gameState = { players: room.players, votes: {}, voteCounts: {}, wordsSpoken: room.wordsSpoken };
                    io.to(roomCode).emit('startVoting', gameState);
                    startVotingTimer(roomCode);
                } else {
                    room.currentTurnIndex = (room.currentTurnIndex + 1) % alivePlayers.length;
                    const nextPlayer = alivePlayers[room.currentTurnIndex];
                    io.to(roomCode).emit('nextPlayerTurn', {
                        currentPlayerName: nextPlayer.name,
                        currentPlayerId: nextPlayer.id,
                        wordsSpoken: room.wordsSpoken
                    });
                }
            }
        }
    });

    socket.on('castVote', ({ roomCode, playerIdToVote }) => {
        const room = rooms[roomCode];
        const voter = room.players.find(p => p.id === socket.id);
        if (!room || room.gameState !== 'voting' || !voter || !voter.isAlive || room.votes[socket.id]) return;
        
        room.votes[socket.id] = playerIdToVote;
        
        const voteCounts = {};
        Object.values(room.votes).forEach(votedId => {
            voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
        });
        
        io.to(roomCode).emit('voteUpdate', { voteCounts });
        
        const livingPlayers = room.players.filter(p => p.isAlive).length;
        if (Object.keys(room.votes).length === livingPlayers) {
            clearInterval(room.votingTimer);
            room.votingTimer = null;
            setTimeout(() => tallyVotes(roomCode), 2000);
        }
    });

    socket.on('playAgain', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || socket.id !== room.hostId) return;
        
        room.gameState = 'lobby';
        room.votes = {};
        room.impostorIds = [];
        room.players.forEach(p => p.isAlive = true);
        if (room.votingTimer) {
            clearInterval(room.votingTimer);
            room.votingTimer = null;
        }
        
        io.to(roomCode).emit('returnToLobby');
        io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
    });
    
    socket.on('kickPlayer', ({ roomCode, playerIdToKick }) => {
        const room = rooms[roomCode];
        if (room && room.hostId === socket.id) {
            const playerIndex = room.players.findIndex(p => p.id === playerIdToKick);
            if (playerIndex > -1) {
                room.players.splice(playerIndex, 1);
                io.to(playerIdToKick).emit('youWereKicked');
                io.sockets.sockets.get(playerIdToKick)?.disconnect();
                io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
            }
        }
    });

    socket.on('leaveRoom', ({ roomCode }) => {
        const room = rooms[roomCode];
        if(room) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex > -1) {
                room.players.splice(playerIndex, 1);
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                } else {
                    if (room.hostId === socket.id) {
                        room.hostId = room.players[0].id;
                    }
                    io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
                }
            }
        }
        socket.leave(roomCode);
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const wasHost = room.hostId === socket.id;
                room.players.splice(playerIndex, 1);
                
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                } else {
                    if (wasHost) room.hostId = room.players[0].id;
                    io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

