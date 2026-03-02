import React from 'react';
import { useTranslation } from '../../i18n/translations';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';

export function AnalyticsPage({ log, weeklyData, goals, language }) {
  const { t } = useTranslation(language);

  const stats = [
    { label: t('eaten'), value: log.reduce((s, m) => s+Number(m.calories), 0), color: 'var(--gold)', unit: 'kcal' },
    { label: t('goal'), value: goals.daily_calorie_goal, color: 'var(--text)', unit: 'kcal' },
    { label: t('protein'), value: log.reduce((s, m) => s+Number(m.protein||0), 0), color: 'var(--green)', unit: 'g' },
    { label: t('carbs'), value: log.reduce((s, m) => s+Number(m.carbs||0), 0), color: 'var(--blue)', unit: 'g' }
  ];

  const pieData = [
    { name: t('protein'), value: log.reduce((s, m) => s+Number(m.protein||0), 0)*4, color: 'var(--green)' },
    { name: t('carbs'), value: log.reduce((s, m) => s+Number(m.carbs||0), 0)*4, color: 'var(--blue)' },
    { name: t('fat'), value: log.reduce((s, m) => s+Number(m.fat||0), 0)*9, color: 'var(--gold)' },
  ];

  return (
    <div className="analytics-page animate-in" style={{ paddingBottom: '60px' }}>
      <div className="card" style={{ padding: '48px 32px', marginBottom: '40px' }}>
         <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', borderRight: '2px dotted var(--gold)', borderTop: '2px dotted var(--gold)', opacity: 0.1, borderTopRightRadius: '16px' }}></div>
         <h2 className="serif" style={{ fontSize: '42px', marginBottom: '8px', letterSpacing: '-1px' }}>{t('yourJourney')}</h2>
         <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '40px' }}>{t('activeStats')}</p>
         
         <div className="grid-2x2">
            {stats.map(s => (
               <div key={s.label} className="raised-card" style={{ 
                 padding: '28px', 
                 borderRadius: '16px', 
                 border: '1px solid var(--border)',
                 background: 'var(--raised)',
                 position: 'relative',
                 overflow: 'hidden',
                 boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.3)'
               }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderRight: '1px dashed var(--gold)', borderTop: '1px dashed var(--gold)', opacity: 0.2 }}></div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontWeight: 600 }}>{s.label}</p>
                  <p className="serif" style={{ fontSize: '36px', color: s.color, lineHeight: 1, textShadow: s.color === 'var(--gold)' ? '0 2px 8px var(--gold-glow)' : 'none' }}>{s.value} <small style={{ fontSize: '14px', color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>{s.unit}</small></p>
               </div>
            ))}
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
         <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Leather Strap Header */}
            <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
              <div className="buckle">
                <div className="buckle-prong"></div>
              </div>
              <span className="strap-text" style={{ fontSize: '13px' }}>{t('weeklyComparison')}</span>
            </div>
            
            <div style={{ padding: '32px', height: '300px' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)', fontWeight: 500 }} />
                     <YAxis hide domain={[0, goals.daily_calorie_goal * 1.2]} />
                     <Tooltip 
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'var(--text)' }}
                        itemStyle={{ color: 'var(--gold)', fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: 600 }}
                        cursor={{ fill: 'var(--raised)', opacity: 0.5, radius: [8, 8, 0, 0] }}
                     />
                     <Bar dataKey="calories" radius={[6, 6, 0, 0]} barSize={28}>
                        {weeklyData.map((entry, index) => <Cell key={index} fill={entry.calories > goals.daily_calorie_goal ? 'var(--red)' : 'var(--gold)'} style={{ filter: entry.calories > goals.daily_calorie_goal ? 'none' : 'drop-shadow(0 0 6px var(--gold-glow))' }} />)}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
              <span className="fleur" style={{ marginLeft: '12px' }}>⚜</span>
              <span className="strap-text" style={{ fontSize: '13px' }}>{t('whatsInside')}</span>
            </div>
            
            <div style={{ padding: '32px', height: '300px', position: 'relative' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie 
                        data={pieData} 
                        innerRadius={80} 
                        outerRadius={105} 
                        paddingAngle={6} 
                        dataKey="value"
                        stroke="none"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={index} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px rgba(197, 160, 85, 0.2))` }} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                        formatter={(value) => [`${value} kcal`, 'Calories']}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span className="serif" style={{ fontSize: '24px', color: 'var(--gold)', textShadow: '0 2px 8px var(--gold-glow)' }}>{t('macros')}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px', fontWeight: 600 }}>{t('composition')}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="card" style={{ marginTop: '32px', padding: '0' }}>
         <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
           <span className="fleur" style={{ marginLeft: '12px' }}>🎖️</span>
           <span className="strap-text" style={{ fontSize: '13px' }}>{t('achievements')}</span>
         </div>
         <div style={{ padding: '32px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
            <Badge emoji="🔥" label={t('streak3')} active={true} t={t} />
            <Badge emoji="🥑" label={t('macroMaster')} active={true} t={t} />
            <Badge emoji="💧" label={t('hydroHero')} active={false} t={t} />
            <Badge emoji="🏋️" label={t('ironWarrior')} active={false} t={t} />
         </div>
      </div>
    </div>
  );
}

function Badge({ emoji, label, active, t }) {
  return (
    <div style={{ 
      minWidth: '130px', 
      padding: '24px', 
      background: active ? 'var(--raised)' : 'transparent', 
      border: `2px solid ${active ? 'var(--gold)' : 'var(--border)'}`, 
      borderRadius: '20px', 
      textAlign: 'center', 
      opacity: active ? 1 : 0.4,
      transition: 'var(--transition)',
      boxShadow: active ? 'inset 0 2px 4px rgba(255,255,255,0.05), inset 0 -2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.4), 0 0 15px var(--gold-glow)' : 'none',
      transform: active ? 'translateY(-2px)' : 'none'
    }}>
       <div style={{ fontSize: '42px', marginBottom: '12px', filter: active ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : 'none' }}>{emoji}</div>
       <p style={{ fontSize: '12px', fontWeight: '700', color: active ? 'var(--text)' : 'var(--muted)' }}>{label}</p>
       {active && <p style={{ fontSize: '10px', color: 'var(--gold)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{t('unlocked')}</p>}
    </div>
  );
}
