import { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = '54a934fa20b1ccc3a5bd1d2076f90556';
const FORM_IDS = {
    Checkin: '261065067494966',
    Message: '261065765723966',
    Sighting: '261065244786967',
    Note: '261065509008958',
    Tip: '261065875889981'
};

const parseAnswers = (answers) => {
    const result = {};
    Object.values(answers).forEach(val => {
        if (val.name) {
            if (typeof val.answer === 'object' && val.answer !== null) {
                if (val.answer.first || val.answer.last) {
                    result[val.name] = `${val.answer.first || ''} ${val.answer.last || ''}`.trim();
                } else {
                    result[val.name] = JSON.stringify(val.answer);
                }
            } else {
                result[val.name] = val.answer;
            }
        }
    });
    return result;
};

const getSummary = (type, data) => {
    switch (type) {
        case 'Message': return data.text || 'No message content';
        case 'Tip': return data.tip || 'Anonymous tip received';
        case 'Note': return data.note || 'Podo left a note';
        case 'Sighting': return data.note ? `Seen with ${data.seenWith}: ${data.note}` : `Seen with ${data.seenWith}`;
        case 'Checkin': return data.note || 'Podo checked in';
        default: return 'No summary available';
    }
};

export const useSurveillanceData = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllEvents = async () => {
            setLoading(true);
            try {
                const requests = Object.entries(FORM_IDS).map(([type, id]) =>
                    axios.get(`https://api.jotform.com/form/${id}/submissions?apiKey=${API_KEY}`)
                        .then(res => ({ type, data: res.data.content }))
                );

                const results = await Promise.all(requests);
                const combined = results.flatMap(({ type, data }) =>
                    data.map(sub => {
                        const parsed = parseAnswers(sub.answers);
                        let involvedParty = '-';
                        if (type === 'Message') {
                            involvedParty = parsed.senderName === 'Podo' ? parsed.recipientName : parsed.senderName;
                        } else if (type === 'Checkin') {
                            involvedParty = parsed.personName;
                        } else if (type === 'Sighting') {
                            involvedParty = parsed.seenWith;
                        } else if (type === 'Tip') {
                            involvedParty = parsed.suspectName;
                        } else if (type === 'Note') {
                            involvedParty = parsed.mentionedPeople;
                        }

                        return {
                            id: sub.id,
                            timestamp: parsed.timestamp || sub.created_at,
                            type: type,
                            location: parsed.location || 'Unknown',
                            involvedParty: involvedParty || '-',
                            summary: getSummary(type, parsed),
                            raw: sub
                        };
                    })
                );

                // Sort by timestamp DESC by default for the raw stream
                combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setEvents(combined);
                setError(null);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch surveillance data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllEvents();
    }, []);

    return { events, loading, error };
};
