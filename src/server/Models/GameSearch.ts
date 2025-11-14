import Model from './Model.js';
import axios from 'axios';
import { SteamDBGameImage, SteamDBGameSearch } from '../types/SteamDB.js';
import GameModel from './Game.js';

// Create an Axios instance
const steamGridDb = axios.create({
    baseURL: 'https://www.steamgriddb.com/api/v2',
    headers: {
        'Authorization': `Bearer ${process.env.STEAM_GRID_ID_KEY}`
    },
    params: {
        "types": "static",
        "limit": 50,
        "style": "official"
    }
});


export default class GameSearchModel extends Model {

    static async read(gameID: string) {

        const game = steamGridDb.get<SteamDBGameImage>(`/games/id/${gameID}`).catch(err => {
            console.error(`Error fetching game data for ${gameID}:`, err.message);
            return { data: { data: null } };
        });
        const icons = steamGridDb.get<SteamDBGameImage>(`/icons/game/${gameID}`).catch(err => {
            console.error(`Error fetching icons for ${gameID}:`, err.message);
            return { data: { data: [] } };
        });
        const logos = steamGridDb.get<SteamDBGameImage>(`/logos/game/${gameID}`).catch(err => {
            console.error(`Error fetching logos for ${gameID}:`, err.message);
            return { data: { data: [] } };
        });
        const heroes = steamGridDb.get<SteamDBGameImage>(`/heroes/game/${gameID}`, {
            params: {
                "dimensions": "1920x620"
            }
        }).catch(err => {
            console.error(`Error fetching heroes for ${gameID}:`, err.message);
            return { data: { data: [] } };
        });
        const grids = steamGridDb.get<SteamDBGameImage>(`/grids/game/${gameID}`, {
            params: {
                "dimensions": "600x900"
            }
        }).catch(err => {
            console.error(`Error fetching grids for ${gameID}:`, err.message);
            return { data: { data: [] } };
        });
        const header = steamGridDb.get<SteamDBGameImage>(`/grids/game/${gameID}`, {
            params: {
                "dimensions": "460x215"
            }
        }).catch(err => {
            console.error(`Error fetching header for ${gameID}:`, err.message);
            return { data: { data: [] } };
        });

        const [gameResponse, iconsResponse, logosResponse, heroesResponse, gridsResponse, headerResponse] = await Promise.all([game, icons, logos, heroes, grids, header]);

        console.log(gameResponse.data.data);
        return {
            game: gameResponse.data.data,
            icon: iconsResponse.data.data,
            logo: logosResponse.data.data,
            hero: heroesResponse.data.data,
            grid: gridsResponse.data.data,
            card: headerResponse.data.data
        };

    }

    static create(game: Parameters<typeof GameModel.create>[0]) {
        console.log("Creating game", game);
        return GameModel.create(game);
    }

    static async list() {
        return GameModel.list();
    }

    static async search(query: string) {
        try {
            const response = await steamGridDb.get<SteamDBGameSearch>(`/search/autocomplete/${query}`);
            return response.data;
        } catch (error) {
            console.error(`Error searching for games with query "${query}":`, error);
            return { data: [] };
        }
    }

}
