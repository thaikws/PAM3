
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as location from 'expo-location';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [testesLocalizacao, setTestesLocalizacao] = useState([]);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mensagem, setMensagem] = useState('');

  // =========================
  // LIMPAR FORMULÁRIO
  // =========================
  const limparFormulario = () => {
    setNome('');
    setEndereco('');
    setLatitude('');
    setLongitude('');
    setUsuarioEditando(null);
  };

  // =========================
  // CADASTRAR
  // =========================
  const adicionarUsuario = () => {
    if (
      !nome.trim() ||
      !endereco.trim() ||
      !latitude.trim() ||
      !longitude.trim()
    ) {
      setMensagem(
        'Preencha nome, endereço, latitude e longitude.'
      );
      return;
    }

    const novoUsuario = {
      id: Date.now().toString(),
      name: nome.trim(),
      address: {
        street: endereco.trim(),
        suite: '',
        city: '',
      },
      latitude: latitude.trim(),
      longitude: longitude.trim(),
    };

    setUsuarios((lista) => [novoUsuario, ...lista]);
    limparFormulario();
    setMensagem('Usuário cadastrado com sucesso!');
  };

  // =========================
  // EDITAR
  // =========================
  const editarUsuario = (usuario) => {
    setUsuarioEditando(usuario.id);
    setNome(usuario.name);
    setEndereco(usuario.address?.street || '');
    setLatitude(usuario.latitude || '');
    setLongitude(usuario.longitude || '');

    setMensagem(
      'Altere os dados e clique em Atualizar.'
    );
  };

  // =========================
  // ATUALIZAR
  // =========================
  const atualizarUsuario = () => {
    if (
      !nome.trim() ||
      !endereco.trim() ||
      !latitude.trim() ||
      !longitude.trim()
    ) {
      setMensagem(
        'Preencha nome, endereço, latitude e longitude.'
      );
      return;
    }

    setUsuarios((lista) =>
      lista.map((usuario) =>
        usuario.id === usuarioEditando
          ? {
              ...usuario,
              name: nome.trim(),
              address: {
                ...usuario.address,
                street: endereco.trim(),
              },
              latitude: latitude.trim(),
              longitude: longitude.trim(),
            }
          : usuario
      )
    );

    limparFormulario();
    setMensagem('Usuário atualizado com sucesso!');
  };

  // =========================
  // CANCELAR EDIÇÃO
  // =========================
  const cancelarEdicao = () => {
    limparFormulario();
    setMensagem('Edição cancelada.');
  };

  // =========================
  // EXCLUIR
  // =========================
  const excluirUsuario = (id) => {
    const usuario = usuarios.find(
      (item) => item.id === id
    );

    if (!usuario) return;

    const excluir = () => {
      setUsuarios((lista) =>
        lista.filter((item) => item.id !== id)
      );

      if (usuarioEditando === id) {
        limparFormulario();
      }

      setMensagem('Usuário excluído com sucesso!');
    };

    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `Deseja realmente excluir "${usuario.name}"?`
        )
      ) {
        excluir();
      }

      return;
    }

    Alert.alert(
      'Excluir usuário',
      `Deseja realmente excluir "${usuario.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: excluir,
        },
      ]
    );
  };

  // =========================
  // MOSTRAR LOCALIZAÇÃO
  // =========================
  const mostrarLocalizacao = (usuario) => {
    const texto =
      `Endereço: ${usuario.address?.street || 'Não informado'}\n\n` +
      `Latitude: ${usuario.latitude || 'Não informada'}\n` +
      `Longitude: ${usuario.longitude || 'Não informada'}`;

    if (Platform.OS === 'web') {
      window.alert(
        `Localização de ${usuario.name}\n\n${texto}`
      );
      return;
    }

    Alert.alert(`Localização de ${usuario.name}`, texto);
  };

  // =========================
  // OBTER LOCALIZAÇÃO
  // =========================
  const obterLocalizacao = async () => {
    if (
      buscandoLocalizacao ||
      testesLocalizacao.length >= 3
    ) {
      return;
    }

    setBuscandoLocalizacao(true);
    setMensagem('');

    try {
      let posicao;

      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          throw new Error(
            'Este navegador não oferece suporte à localização.'
          );
        }

        posicao = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            }
          );
        });
      } else {
        const permissao =
          await location.requestForegroundPermissionsAsync();

        if (permissao.status !== 'granted') {
          setMensagem(
            'Permissão de localização negada.'
          );
          return;
        }

        posicao = await location.getCurrentPositionAsync({
          accuracy: location.Accuracy.High,
        });
      }

      const teste = {
        numero: testesLocalizacao.length + 1,
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
        precisao: posicao.coords.accuracy,
      };

      setTestesLocalizacao((anteriores) => [
        ...anteriores,
        teste,
      ]);

      setMensagem(`Teste ${teste.numero} registrado!`);
    } catch (erro) {
      console.error('Erro de localização:', erro);

      if (Platform.OS === 'web') {
        const mensagensErro = {
          1: 'Permissão negada. Autorize a localização no navegador.',
          2: 'Não foi possível determinar a localização.',
          3: 'A localização demorou demais. Tente novamente.',
        };

        setMensagem(
          `Erro: ${
            mensagensErro[erro.code] ||
            erro.message ||
            'Falha ao obter a localização.'
          }`
        );
      } else {
        setMensagem(
          'Não foi possível obter a localização. Verifique a permissão e tente novamente.'
        );
      }
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  // =========================
  // REINICIAR TESTES
  // =========================
  const reiniciarTestes = () => {
    setTestesLocalizacao([]);
    setMensagem(
      'Medições reiniciadas. Faça o primeiro teste.'
    );
  };

  // =========================
  // BUSCAR USUÁRIOS
  // =========================
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Falha ao carregar usuários.');
        }

        return response.json();
      })
      .then((data) => {
        const usuariosComLocalizacao = data.map(
          (usuario) => ({
            ...usuario,
            latitude: '',
            longitude: '',
          })
        );

        setUsuarios(usuariosComLocalizacao);
      })
      .catch((erro) => {
        console.error('Erro ao buscar usuários:', erro);
        setMensagem(
          'Não foi possível carregar os usuários.'
        );
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  // =========================
  // TELA
  // =========================
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="auto" />

      <Text style={styles.titulo}>
        Sistema de Cadastro
      </Text>

      <Text style={styles.dupla}>
        Thainá - 3DS
      </Text>

      {/* FORMULÁRIO */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Digite o Nome"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite o Endereço"
          value={endereco}
          onChangeText={setEndereco}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite a Latitude"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite a Longitude"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />

        {usuarioEditando !== null ? (
          <>
            <TouchableOpacity
              style={styles.botaoAtualizar}
              onPress={atualizarUsuario}
            >
              <Text style={styles.textoBotao}>
                Atualizar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={cancelarEdicao}
            >
              <Text style={styles.textoBotao}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.botao}
            onPress={adicionarUsuario}
          >
            <Text style={styles.textoBotao}>
              Cadastrar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MENSAGEM */}
      {mensagem !== '' && (
        <View style={styles.mensagem}>
          <Text style={styles.textoMensagem}>
            {mensagem}
          </Text>
        </View>
      )}

      {/* TESTES DE LOCALIZAÇÃO */}
      <View style={styles.form}>
        <Text style={styles.nome}>
          Teste de localização
        </Text>

        <Text style={styles.endereco}>
          {testesLocalizacao.length < 3
            ? `Tentativa ${testesLocalizacao.length + 1} de 3`
            : 'As três tentativas foram concluídas.'}
        </Text>

        <TouchableOpacity
          style={[
            styles.botaoLocalizacao,
            (buscandoLocalizacao ||
              testesLocalizacao.length >= 3) &&
              styles.botaoDesabilitado,
          ]}
          onPress={obterLocalizacao}
          disabled={
            buscandoLocalizacao ||
            testesLocalizacao.length >= 3
          }
        >
          <Text style={styles.textoBotao}>
            {buscandoLocalizacao
              ? 'Obtendo localização...'
              : 'Obter minha localização'}
          </Text>
        </TouchableOpacity>

        {testesLocalizacao.map((teste) => (
          <View
            key={teste.numero}
            style={styles.card}
          >
            <Text style={styles.nome}>
              Teste {teste.numero}
            </Text>

            <Text style={styles.coordenadas}>
              Latitude: {teste.latitude.toFixed(6)}
            </Text>

            <Text style={styles.coordenadas}>
              Longitude: {teste.longitude.toFixed(6)}
            </Text>

            <Text style={styles.coordenadas}>
              Precisão estimada:{' '}
              {teste.precisao == null
                ? 'Não informada'
                : `${teste.precisao.toFixed(2)} metros`}
            </Text>
          </View>
        ))}

        {testesLocalizacao.length === 3 && (
          <>
            <Text style={styles.nome}>
              Comparação dos resultados
            </Text>

            <Text style={styles.endereco}>
              Compare as latitudes, longitudes e precisões
              das três tentativas. Resultados iguais ou
              próximos também são válidos.
            </Text>

            <TouchableOpacity
              style={styles.botao}
              onPress={reiniciarTestes}
            >
              <Text style={styles.textoBotao}>
                Reiniciar testes
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* LISTA DE USUÁRIOS */}
      <Text style={styles.tituloLista}>
        Usuários cadastrados
      </Text>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
        />
      ) : usuarios.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.endereco}>
            Nenhum usuário disponível.
          </Text>
        </View>
      ) : (
        usuarios.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.nome}>
              {item.name}
            </Text>

            <Text style={styles.endereco}>
              {item.address?.street || 'Sem endereço'}
              {item.address?.suite
                ? `, ${item.address.suite}`
                : ''}
              {item.address?.city
                ? ` - ${item.address.city}`
                : ''}
            </Text>

            <Text style={styles.coordenadas}>
              Latitude: {item.latitude || 'Não informada'}
            </Text>

            <Text style={styles.coordenadas}>
              Longitude: {item.longitude || 'Não informada'}
            </Text>

            <View style={styles.botoes}>
              <TouchableOpacity
                style={styles.botaoEditar}
                onPress={() => editarUsuario(item)}
              >
                <Text style={styles.textoBotao}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoLocalizacao}
                onPress={() => mostrarLocalizacao(item)}
              >
                <Text style={styles.textoBotao}>
                  Localização
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={() => excluirUsuario(item.id)}
              >
                <Text style={styles.textoBotao}>
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// =========================
// ESTILOS
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d2e2ff',
  },

  conteudo: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },

  dupla: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  tituloLista: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
  },

  form: {
    backgroundColor: '#f7f8fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },

  botao: {
    backgroundColor: '#97acd3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  botaoAtualizar: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },

  botaoCancelar: {
    backgroundColor: '#777',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 5,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },

  mensagem: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#28a745',
  },

  textoMensagem: {
    color: '#155724',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  endereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  coordenadas: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },

  botoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },

  botaoEditar: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },

  botaoLocalizacao: {
    backgroundColor: '#673AB7',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },

  botaoExcluir: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },
});
