import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Send, 
  Sparkles, 
  Image as ImageIcon, 
  User, 
  Bell, 
  X, 
  Play, 
  ChevronRight,
  Copy,
  Check,
  Camera
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from './lib/utils';
import { 
  generateMotherMessage, 
  generateCaricature, 
  generatePremiumMessage 
} from './services/gemini';

// Categories for the portfolio
const CATEGORIES = [
  { id: 'gratidao', name: 'Gratidão', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  { id: 'inspiracao', name: 'Inspiração', icon: Sparkles, color: 'bg-amber-100 text-amber-600' },
  { id: 'amor', name: 'Amor Infinito', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  { id: 'saudade', name: 'Saudade', icon: Bell, color: 'bg-blue-100 text-blue-600' },
  { id: 'divertidas', name: 'Divertidas', icon: Play, color: 'bg-orange-100 text-orange-600' },
  { id: 'poeticas', name: 'Poéticas', icon: ChevronRight, color: 'bg-purple-100 text-purple-600' },
  { id: 'especial', name: 'Especial', icon: Sparkles, color: 'bg-rose-100 text-rose-600' },
];

export default function App() {
  const [motherName, setMotherName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumLocked, setIsPremiumLocked] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ text: string, category: string, id: string }[]>([]);
  const [personalizedMessage, setPersonalizedMessage] = useState<{ text: string, id: string } | null>(null);
  
  // Premium features state
  const [premiumView, setPremiumView] = useState<'menu' | 'custom' | 'caricature'>('menu');
  const [customDetails, setCustomDetails] = useState('');
  const [caricatureImage, setCaricatureImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (showAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAd, adCountdown]);

  const handleGenerateMessage = async (category: string, force = false) => {
    if (isLoading) return;

    // Lógica de toggle: se clicar na categoria ativa, ela recolhe (fecha)
    if (!force && selectedCategory === category) {
      setSelectedCategory(null);
      return;
    }

    setIsLoading(true);
    if (category !== 'TopPersonalized') {
      setSelectedCategory(category);
    }
    
    try {
      const msg = await generateMotherMessage(category === 'TopPersonalized' ? 'Especial' : category, motherName);
      if (msg) {
        const newMsg = { 
          text: msg, 
          category, 
          id: Math.random().toString(36).substr(2, 9) 
        };

        if (category === 'TopPersonalized') {
          setPersonalizedMessage(newMsg);
        } else {
          // Substitui a mensagem da categoria atual para não criar "outra tela" (item na lista)
          setMessages(prev => {
            const otherMessages = prev.filter(m => m.category !== category);
            return [newMsg, ...otherMessages];
          });
        }
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const startAd = () => {
    setShowAd(true);
    setAdCountdown(5);
  };

  const finishAd = () => {
    setShowAd(false);
    setIsPremiumLocked(false);
  };

  const handleWhatsApp = (text: string) => {
    if (!text) return;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handlePremiumMessage = async () => {
    if (!customDetails.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const msg = await generatePremiumMessage(customDetails);
      if (msg) {
        const newMsg = { 
          text: msg, 
          category: 'Premium', 
          id: Math.random().toString(36).substr(2, 9) 
        };
        // Substitui mensagem premium anterior se existir
        setMessages(prev => {
          const otherMessages = prev.filter(m => m.category !== 'Premium');
          return [newMsg, ...otherMessages];
        });
        setPremiumView('menu');
        setCustomDetails('');
      } else {
        alert('Não foi possível gerar a mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao gerar sua mensagem especial.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  } as any);

  const handleGenerateCaricature = async () => {
    if (!previewImage) return;
    setIsLoading(true);
    try {
      const result = await generateCaricature(previewImage);
      setCaricatureImage(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 relative">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: `url('https://storage.googleapis.com/m-infra.appspot.com/public/res/67e466373760450009767895/67e466373760450009767895.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Top Notification Bar */}
      <div className="bg-rose-400 text-white py-3 px-4 text-center text-sm font-medium shadow-md sticky top-0 z-50 flex items-center justify-center gap-2 overflow-hidden">
        <span>Já enviou mensagem para sua mãe hoje? ❤️</span>
      </div>

      <main className="max-w-2xl mx-auto px-6 pt-8 relative z-10">
        {/* Header */}
        <header className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-white rounded-full shadow-lg mb-4"
          >
            <Heart className="w-10 h-10 text-rose-400 fill-rose-400" />
          </motion.div>
          <p className="text-rose-400 italic text-xl">Espalhando amor em cada palavra</p>
        </header>

        {/* Personalization Section - Now at the top */}
        <section className="glass-card rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-semibold text-gray-700">Personalize sua mensagem</h2>
          </div>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Nome da sua mãe (ex: Maria)"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className="w-full bg-white border-2 border-rose-100 rounded-2xl py-3 px-5 focus:outline-none focus:border-rose-300 transition-colors"
            />
            <button 
              onClick={() => handleGenerateMessage('TopPersonalized', true)}
              disabled={isLoading}
              className="w-full bg-rose-400 text-white font-bold py-3 rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className={cn("w-4 h-4", isLoading && "animate-spin")} />
              {isLoading ? 'Gerando...' : 'Gerar Mensagem'}
            </button>

            {/* Personalized Message Display */}
            <AnimatePresence>
              {personalizedMessage && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-rose-200 shadow-md relative">
                    <button 
                      onClick={() => setPersonalizedMessage(null)}
                      className="absolute top-3 right-3 p-1.5 text-rose-300 hover:text-rose-500 transition-all bg-rose-50 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-base text-gray-700 italic leading-relaxed mb-4 pr-6">
                      {personalizedMessage.text}
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleCopy(personalizedMessage.text, personalizedMessage.id)}
                        className="flex-1 bg-white border-2 border-rose-100 text-rose-500 text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
                      >
                        {copiedIndex === personalizedMessage.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedIndex === personalizedMessage.id ? 'Copiado' : 'Copiar'}
                      </button>
                      <button 
                        onClick={() => handleWhatsApp(personalizedMessage.text)}
                        className="flex-1 bg-rose-500 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-rose-600 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Categories List - Vertical for Slide Effect */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-serif font-bold text-gray-800">Escolha um tema</h2>
            {messages.length > 0 && (
              <button 
                onClick={() => setMessages([])}
                className="text-xs text-rose-400 hover:text-rose-600 font-medium"
              >
                Limpar tudo
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const categoryMessages = messages.filter(m => m.category === cat.name);
              const isActive = selectedCategory === cat.name;

              return (
                <div key={cat.id} className="flex flex-col">
                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerateMessage(cat.name)}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center gap-4 p-5 glass-card rounded-3xl shadow-sm hover:shadow-md transition-all border-2 text-left disabled:opacity-50",
                      isActive ? "border-rose-400 bg-rose-50/30" : "border-transparent"
                    )}
                  >
                    <div className={cn("p-3 rounded-2xl transition-transform", cat.color)}>
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-base font-bold text-gray-700">{cat.name}</span>
                      <p className="text-xs text-gray-400">Clique para gerar uma mensagem</p>
                    </div>
                    <ChevronRight className={cn("w-5 h-5 text-gray-300 transition-transform", isActive && "rotate-90 text-rose-400")} />
                  </motion.button>

                  {/* Messages for this category slide down */}
                  <AnimatePresence>
                    {isActive && categoryMessages.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="py-4 pl-8 space-y-3">
                          {categoryMessages.map((msg) => (
                            <motion.div 
                              key={msg.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-rose-100 shadow-sm relative"
                            >
                              <button 
                                onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                                className="absolute top-2 right-2 p-1.5 text-rose-300 hover:text-rose-500 transition-all bg-rose-50/50 rounded-full"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <p className="text-sm text-gray-600 italic leading-relaxed mb-3 pr-6">
                                {msg.text}
                              </p>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleCopy(msg.text, msg.id)}
                                  className="flex-1 bg-white border border-rose-100 text-rose-400 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-rose-50 transition-colors"
                                >
                                  {copiedIndex === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copiedIndex === msg.id ? 'Copiado' : 'Copiar'}
                                </button>
                                <button 
                                  onClick={() => handleWhatsApp(msg.text)}
                                  className="flex-1 bg-rose-400 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm hover:bg-rose-500 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  WhatsApp
                                </button>
                              </div>
                            </motion.div>
                          ))}
                          <div className="flex justify-center pt-2">
                            <button 
                              onClick={() => handleGenerateMessage(cat.name, true)}
                              disabled={isLoading}
                              className="bg-rose-100 text-rose-600 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-rose-200 transition-all shadow-sm active:scale-95"
                            >
                              <Sparkles className={cn("w-4 h-4", isLoading && "animate-spin")} />
                              {isLoading ? 'Gerando...' : 'Gerar outra mensagem'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Premium Messages History */}
            {messages.some(m => m.category === 'Premium') && (
              <div className="flex flex-col">
                <div className="flex items-center gap-4 p-5 glass-card rounded-3xl border-2 border-amber-200 bg-amber-50/30">
                  <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="text-base font-bold text-gray-700">Mensagens Premium</span>
                    <p className="text-xs text-gray-400">Suas criações exclusivas</p>
                  </div>
                </div>
                <div className="py-4 pl-8 space-y-3">
                  {messages.filter(m => m.category === 'Premium').map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="bg-amber-50/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-sm relative"
                    >
                      <button 
                        onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                        className="absolute top-2 right-2 p-1.5 text-amber-300 hover:text-amber-500 transition-all bg-amber-100/50 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-sm text-gray-700 italic leading-relaxed mb-3 pr-6">
                        {msg.text}
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex-1 bg-white border border-amber-100 text-amber-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-amber-50 transition-colors"
                        >
                          {copiedIndex === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedIndex === msg.id ? 'Copiado' : 'Copiar'}
                        </button>
                        <button 
                          onClick={() => handleWhatsApp(msg.text)}
                          className="flex-1 bg-amber-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm hover:bg-amber-600 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          WhatsApp
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Premium Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-serif font-bold text-gray-800">Sessão Premium</h2>
            <div className="flex items-center gap-1 bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Exclusivo
            </div>
          </div>

          {isPremiumLocked ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 to-rose-500 p-8 text-white shadow-xl">
              <div className="relative z-10 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">Conteúdo Especial</h3>
                <p className="text-rose-50 mb-6 text-sm">Assista a um breve anúncio para desbloquear mensagens de luxo e caricaturas personalizadas.</p>
                <button 
                  onClick={startAd}
                  className="bg-white text-rose-500 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-rose-50 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Assistir Anúncio
                </button>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setPremiumView('custom')}
                className="flex items-center gap-4 p-5 bg-white border-2 border-amber-200 rounded-3xl shadow-sm hover:border-amber-400 transition-all text-left"
              >
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Mensagem de Luxo</h4>
                  <p className="text-xs text-gray-500">Totalmente personalizada</p>
                </div>
              </button>
              <button 
                onClick={() => setPremiumView('caricature')}
                className="flex items-center gap-4 p-5 bg-white border-2 border-amber-200 rounded-3xl shadow-sm hover:border-amber-400 transition-all text-left"
              >
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Caricatura Mágica</h4>
                  <p className="text-xs text-gray-500">Transforme uma foto</p>
                </div>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Ad Modal Simulation */}
      <AnimatePresence>
        {showAd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-white text-center p-8">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Google AdMob</p>
                <h3 className="text-xl font-bold mb-4">Anúncio de Demonstração</h3>
                <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-400">O conteúdo será desbloqueado em breve...</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              {adCountdown > 0 ? (
                <div className="bg-white/10 text-white px-6 py-2 rounded-full text-sm">
                  Pular em {adCountdown}s
                </div>
              ) : (
                <button 
                  onClick={finishAd}
                  className="bg-rose-400 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2"
                >
                  Fechar Anúncio <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Feature Modals */}
      <AnimatePresence>
        {premiumView !== 'menu' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setPremiumView('menu')}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {premiumView === 'custom' ? (
                <div>
                  <div className="text-center mb-8">
                    <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif font-bold text-gray-800">Mensagem de Luxo</h3>
                    <p className="text-sm text-gray-500">Conte-nos detalhes especiais sobre sua mãe</p>
                  </div>
                  <textarea 
                    placeholder="Ex: Ela adora girassóis, faz o melhor bolo de cenoura e sempre me apoia nos meus sonhos..."
                    value={customDetails}
                    onChange={(e) => setCustomDetails(e.target.value)}
                    className="w-full h-40 bg-gray-50 border-2 border-gray-100 rounded-3xl p-5 focus:outline-none focus:border-amber-300 transition-colors mb-6 resize-none"
                  />
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handlePremiumMessage}
                      disabled={!customDetails.trim() || isLoading}
                      className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Criando magia...' : 'Gerar Mensagem Especial'}
                    </button>
                    <button 
                      onClick={() => setPremiumView('menu')}
                      className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-8">
                    <ImageIcon className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif font-bold text-gray-800">Caricatura Mágica</h3>
                    <p className="text-sm text-gray-500">Transforme uma foto em arte</p>
                  </div>

                  {!caricatureImage ? (
                    <div className="space-y-6">
                      <div 
                        {...getRootProps()} 
                        className={cn(
                          "border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer",
                          isDragActive ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-gray-50 hover:border-amber-300"
                        )}
                      >
                        <input {...getInputProps()} />
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" className="w-32 h-32 mx-auto rounded-2xl object-cover shadow-md" />
                        ) : (
                          <>
                            <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Clique ou arraste uma foto aqui</p>
                          </>
                        )}
                      </div>
                      <button 
                        onClick={handleGenerateCaricature}
                        disabled={!previewImage || isLoading}
                        className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-colors disabled:opacity-50 mb-3"
                      >
                        {isLoading ? 'Desenhando...' : 'Criar Caricatura'}
                      </button>
                      <button 
                        onClick={() => setPremiumView('menu')}
                        className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors"
                      >
                        Voltar
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.img 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        src={caricatureImage} 
                        alt="Caricatura" 
                        className="w-full aspect-square rounded-3xl object-cover shadow-xl mb-6" 
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setCaricatureImage(null)}
                          className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors"
                        >
                          Tentar Outra
                        </button>
                        <button 
                          onClick={() => {
                            if (!caricatureImage) return;
                            const link = document.createElement('a');
                            link.href = caricatureImage;
                            link.download = `caricatura-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex-1 bg-rose-400 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-rose-500 transition-colors"
                        >
                          Salvar Arte
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
