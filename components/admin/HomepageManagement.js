import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Play, X, Save, Loader } from 'lucide-react';

const HomepageManagement = () => {
  const [showcaseData, setShowcaseData] = useState({
    videoUrl: '',
    thumbnailUrl: '',
    title: 'Offre Spéciale',
    subtitle: 'Découvrez nos meilleures offres',
    description: 'Regardez notre vidéo de présentation pour découvrir nos dernières offres et nouveautés.',
    ctaText: 'Voir les offres'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchShowcaseData();
  }, []);

  const fetchShowcaseData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/showcase');
      if (response.ok) {
        const data = await response.json();
        setShowcaseData(data);
      }
    } catch (error) {
      console.error('Error fetching showcase data:', error);
      showMessage('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShowcaseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      showMessage('Le fichier est trop volumineux. Taille maximum: 50MB', 'error');
      return;
    }

    // For video files, upload directly to server
    if (type === 'video') {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('video', file);

        const response = await fetch('/api/showcase/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setShowcaseData(prev => ({
            ...prev,
            videoUrl: `/api/showcase/video` // Use the video serving endpoint
          }));
          showMessage('Vidéo uploadée avec succès !', 'success');
        } else {
          let errorMessage = 'Erreur lors de l\'upload';
          
          // Handle different error status codes
          if (response.status === 413) {
            errorMessage = 'Le fichier est trop volumineux. Taille maximum: 50MB';
          } else {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
              // If response is not JSON, use status text
              errorMessage = response.statusText || errorMessage;
            }
          }
          
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        showMessage(error.message || 'Erreur lors de l\'upload de la vidéo', 'error');
      } finally {
        setLoading(false);
      }
    } else if (type === 'thumbnail') {
      // For thumbnails, use base64 (smaller files)
      const reader = new FileReader();
      reader.onload = (event) => {
        setShowcaseData(prev => ({
          ...prev,
          thumbnailUrl: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type) => {
    if (type === 'video') {
      setShowcaseData(prev => ({
        ...prev,
        videoUrl: ''
      }));
    } else if (type === 'thumbnail') {
      setShowcaseData(prev => ({
        ...prev,
        thumbnailUrl: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Remove video data from payload since it's stored separately
      const { videoUrl, ...dataToSave } = showcaseData;
      
      const response = await fetch('/api/showcase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        showMessage('Vidéo de présentation mise à jour avec succès !', 'success');
      } else {
        throw new Error('Failed to update showcase');
      }
    } catch (error) {
      console.error('Error updating showcase:', error);
      showMessage('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion de la vidéo de présentation
        </h2>
        <p className="text-gray-600">
          Configurez la vidéo qui sera affichée sur la page d'accueil pour présenter vos offres spéciales.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Vidéo de présentation *
          </label>
          {showcaseData.videoUrl ? (
            <div className="relative">
              <video
                src={showcaseData.videoUrl.startsWith('data:') ? showcaseData.videoUrl : `/api/showcase/video`}
                className="w-full max-w-sm h-auto rounded-lg border border-gray-200"
                controls
                preload="metadata"
                poster={showcaseData.thumbnailUrl || ''}
                style={{ maxHeight: '300px', objectFit: 'contain' }}
              />
              <button
                type="button"
                onClick={() => removeFile('video')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                className="hidden"
                id="video-upload"
                disabled={loading}
              />
              <label
                htmlFor="video-upload"
                className={`flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    <span className="text-lg font-medium text-gray-700 mb-2">
                      Upload en cours...
                    </span>
                    <span className="text-sm text-gray-500">
                      Veuillez patienter
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-700 mb-2">
                      Sélectionner une vidéo
                    </span>
                    <span className="text-sm text-gray-500">
                      Formats acceptés: MP4, WebM, OGG (max 50MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Image de prévisualisation
          </label>
          {showcaseData.thumbnailUrl ? (
            <div className="relative inline-block">
              <Image
                src={showcaseData.thumbnailUrl}
                alt="Thumbnail"
                width={192}
                height={128}
                className="w-48 h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeFile('thumbnail')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center w-48">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'thumbnail')}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Ajouter une image
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Content Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre principal
            </label>
            <input
              type="text"
              name="title"
              value={showcaseData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Offre Spéciale"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-titre
            </label>
            <input
              type="text"
              name="subtitle"
              value={showcaseData.subtitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Découvrez nos meilleures offres"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={showcaseData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Description de la vidéo de présentation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte du bouton d'action
          </label>
          <input
            type="text"
            name="ctaText"
            value={showcaseData.ctaText}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Voir les offres"
          />
        </div>

        {/* Preview Section */}
        {showcaseData.videoUrl && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
            <div className="max-w-2xl">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {showcaseData.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {showcaseData.description}
                </p>
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  src={showcaseData.videoUrl}
                  className="w-full h-auto"
                  poster={showcaseData.thumbnailUrl}
                  controls
                />
                
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold mb-1">
                    {showcaseData.title}
                  </h3>
                  <p className="text-sm opacity-90">
                    {showcaseData.subtitle}
                  </p>
                </div>
              </div>
              
              {showcaseData.ctaText && (
                <div className="text-center mt-4">
                  <button className="bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold px-6 py-2 rounded-lg">
                    {showcaseData.ctaText}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving || !showcaseData.videoUrl}
            className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomepageManagement;
