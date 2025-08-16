import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const showcase = await db.collection('showcase').findOne({});
      
      if (!showcase) {
        return res.status(200).json({
          videoUrl: '',
          thumbnailUrl: '',
          title: 'Offre Spéciale',
          subtitle: 'Découvrez nos meilleures offres',
          description: 'Regardez notre vidéo de présentation pour découvrir nos dernières offres et nouveautés.',
          ctaText: 'Voir les offres'
        });
      }
      
      res.status(200).json(showcase);
    } catch (error) {
      console.error('Error fetching showcase data:', error);
      res.status(500).json({ error: 'Failed to fetch showcase data' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { db } = await connectToDatabase();
      const { videoUrl, thumbnailUrl, title, subtitle, description, ctaText } = req.body;
      
      const result = await db.collection('showcase').updateOne(
        {},
        {
          $set: {
            videoUrl: videoUrl || '',
            thumbnailUrl: thumbnailUrl || '',
            title: title || 'Offre Spéciale',
            subtitle: subtitle || 'Découvrez nos meilleures offres',
            description: description || 'Regardez notre vidéo de présentation pour découvrir nos dernières offres et nouveautés.',
            ctaText: ctaText || 'Voir les offres',
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      
      res.status(200).json({ success: true, message: 'Showcase updated successfully' });
    } catch (error) {
      console.error('Error updating showcase data:', error);
      res.status(500).json({ error: 'Failed to update showcase data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 